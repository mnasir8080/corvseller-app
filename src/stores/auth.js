// src/stores/auth.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useOnlineStatusStore } from './online-status'
import { useImageManager } from '../composables/useImageManager'
import { config, getApiUrl } from '@/config';
import 'sweetalert2/dist/sweetalert2.min.css';
import Swal from 'sweetalert2';
import localForage from 'localforage';
const userStore = localForage.createInstance({
  name: 'corvsellerDB',
  storeName: 'users'
});
const tillStore = localForage.createInstance({
  name: 'corvsellerDB',
  storeName: 'till'
});
const tillsStore = localForage.createInstance({
  name: 'corvsellerDB',
  storeName: 'tills'
});
export const useAuthStore = defineStore('auth', {
  state: () => ({
    tills: null,
    tillD: null,
    activeStoreD: null,
    userD: null,
    usersD: [],
  }),
  getters: {
    getTills: (state) => state.tills,
    getTillD: (state) => state.tillD,
    getStoreD: (state) => state.activeStoreD,
    isAuthenticated: (state) => !!state.userD,
    getUser: (state) => state.userD,  
  },
  actions: { 

    async updateUsers(usersD) {
      if (!Array.isArray(usersD) || usersD.length === 0) {
        throw new Error('Invalid or empty users data')
      }
      
      const { saveImage } = useImageManager()
      
      const updatedUsers = await Promise.all(usersD.map(async (user) => {
        try {
          let localImagePath = null
          if (user.DPVer && user.DPVer.trim() !== '' && user.dp) {
            const imageUrl = user.dp.startsWith('https://') 
              ? user.dp 
              : `https://storage.googleapis.com/corvseller.appspot.com/usersDP/${user.DPVer}`
            localImagePath = await saveImage(imageUrl)
          }
          
          const updatedUser = {
            ...user,
            imagePath: localImagePath,
            localDp: localImagePath,
            lastUpdated: new Date().toISOString() // Add timestamp for tracking
          }
          
          await userStore.setItem(user.username, updatedUser)
          return updatedUser
        } catch (error) {
          console.error(`Error updating user ${user.username}:`, error)
          return {
            ...user,
            imagePath: null,
            localDp: null,
            lastUpdated: new Date().toISOString()
          }
        }
      }))

      return updatedUsers
    },

    async getAllUsersExceptCurrent() {
      try {
        const currentUser = await userStore.getItem('currentUser')
        const keys = await userStore.keys()
        const userKeys = keys.filter(key => key !== 'currentUser')   
        const users = await Promise.all(
          userKeys.map(async (key) => await userStore.getItem(key))
        )
        // Filter out null values and current user
        const filteredUsers = users.filter(user => 
          user && // ensure user exists
          (!currentUser || user.username !== currentUser.username) // exclude current user if exists
        )
        this.usersD = filteredUsers
        return filteredUsers
      } catch (error) {
        console.error('Error getting users:', error)
        return []
      }
    },

    async loadUsers(type) {
      try {
        // Get existing users from IndexedDB
        const existingUsers = await this.getAllUsersExceptCurrent()
        
        // Fetch current users from server
        // const response = await axios.get(`${BASE_URL}external/load-users`, {
          const response = await axios.get(getApiUrl('external/load-users'), {
          params: {
            storeID: this.activeStoreD.id,
          }
        })
        // console.log(response.data.body.data)
        // Filter users to only include those with 'cashier' role
        const cashierUsers = response.data.body.data.filter(user => 
          user.roles && Array.isArray(user.roles) && user.roles.includes('cashier')
        )
        // console.log(cashierUsers)
        // Update users with filtered data
        const updatedUsers = await this.updateUsers(cashierUsers)
        this.usersD = updatedUsers
        
        // Create sets for efficient comparison
        const currentUsernames = new Set(updatedUsers.map(user => user.username))
        // console.log("currentUsernames",currentUsernames)
        const storedUsernames = new Set(existingUsers.map(user => user.username))
        // console.log("storedUsernames",storedUsernames)

        // Find users that exist in storage but not in current data
        const staleUsers = existingUsers.filter(user => 
          !currentUsernames.has(user.username)
        )
        
        // Remove stale users and their associated data
        if (staleUsers.length > 0) {
          await this.removeStaleUsers(staleUsers)
        }
        
        if(type === "logedIn"){
           // Validate current user
          const currentUser = await userStore.getItem("currentUser")
          if (!currentUsernames.has(currentUser?.username)) {
              // Remove user's profile picture if it exists
            if (currentUser.localDp) {
              await imageManager.removeImage(currentUser.localDp)
            }
            // Remove user from IndexedDB
            await userStore.removeItem(currentUser.username)
            console.warn('Current user no longer exists in system')
            await this.logout()
            return false
          }
        }
       
        
        return true
      } catch (error) {
        console.error('Error loading users:', error)
        throw error
      }
    },

    async removeStaleUsers(staleUsers) {
      const imageManager = useImageManager()
      
      const results = await Promise.allSettled(staleUsers.map(async (user) => {
        try {
          // Remove user's local image if it exists
          if (user.localDp) {
            await imageManager.removeImage(user.localDp)
          }
          
          // Remove user from IndexedDB
          await userStore.removeItem(user.username)
          
          return `Successfully removed user: ${user.username}`
        } catch (error) {
          throw new Error(`Failed to remove user ${user.username}: ${error.message}`)
        }
      }))
      
      // Log results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(result.value)
        } else {
          console.error(result.reason)
        }
      })
    },


    async saveOrUpdateTill(tillData) {
      if (!tillData.id) {
        throw new Error('Till data must have an id property');
      }
      if (!this.activeStoreD) {
        throw new Error('Store Data Not Found');
      }
      await tillStore.setItem(tillData.id.toString(), {
        id: tillData.id,
        tillD: tillData,
        storeD: JSON.stringify(this.activeStoreD),
      });
      this.tillD = tillData;
      return this.tillD;
    },
    async fetchTillData(id) {
      try {
        const tillID = id;
        const userID = this.userD.id;
        if (tillID && userID) {
          // const response = await axios.post(`${BASE_URL}external/assign-till`, { tillID, userID });
          const response = await axios.post(getApiUrl('external/assign-till'), { tillID, userID });
          const tillD = response.data.body.tillD;
          // console.log(tillD)
          if (!tillD.id) {
            tillD.id = tillID;
          }
          if (tillD.LogoVer) {
            const { saveImage } = useImageManager()
            try {
              // Save store logo locally
               const logoUrl = `https://storage.googleapis.com/corvseller.appspot.com/storesDP/${tillD.LogoVer}`
               const localImagePath = await saveImage(logoUrl)
              tillD.imagePath= localImagePath
              tillD.localDp= localImagePath
            } catch (logoError) {
              console.error('Failed to save store logo:', logoError)
            }
          }else{
            tillD.imagePath= null,
            tillD.localDp= null
          }

          await this.saveOrUpdateTill(tillD);
        } else {
          this.swalError("error", "User-ID OR Till-ID Not Found");
        }
      } catch (error) {
        console.error('Error fetching or saving till data:', error);
        this.swalError("error", error.response?.data?.body || error.message || "An error occurred");
      }
    },
    async initializeTills() {
      try {
        const savedTills = await tillsStore.getItem('tills')
        if (savedTills) {
          this.tills = savedTills
        }
      } catch (error) {
        console.error('Failed to initialize store:', error)
      }
    },
    async getTillDataFromLocalForage() {
      const keys = await tillStore.keys();
      if (keys.length > 0) {
        return await tillStore.getItem(keys[0]);
      }
      return null;
    },
    async initializeTill() {
      try {
        const tillData = await this.getTillDataFromLocalForage();
        if (tillData) {
          this.activeStoreD = JSON.parse(tillData.storeD);
          this.tillD = tillData.tillD;
          return tillData;
        }
        return null;
      } catch (error) {
        console.error('Error initializing till:', error);
        this.swalError("error", "Failed to initialize till");
        return null;
      }
    },
    async swalSuccess (title, msg) {
        Swal.fire({
            icon: 'success',
            title: title,
            html: `<span style="color:#2C2; background-color:#EFE; padding:10px; margin-top:5px; border:1px solid #ACA; border-radius:10px; line-height:100px;">
                    <b>${msg}</b></span>`,
            showConfirmButton: true,
            confirmButtonText: 'Done',
            reverseButtons: true,
            showCloseButton: true,
            allowOutsideClick: false
        });
    },
    async swalError(title, msg) {
        Swal.fire({
            icon: 'error',
            title: title,
            html: msg,
            showConfirmButton: false,
            showCloseButton: true,
            allowOutsideClick: false
        });
    },
    async login(username, password, requestType) {
      const onlineStatusStore = useOnlineStatusStore();
      try {
        if (requestType === 'preToken' && onlineStatusStore.online) {
          return await this.onlineLogin(username, password, requestType);
        } else if (requestType === 'postToken') {
          return await this.offlineLogin(username, password);
        }
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
    async processTillsWithLogos(tills) {
      if (!Array.isArray(tills) || tills.length === 0) {
        throw new Error('Invalid or empty tills data')
      }
      const { saveImage } = useImageManager()
      const processedTills = await Promise.all(tills.map(async (till) => {
        try {
          let localImagePath = null
          if (till.LogoVer) {
            const logoUrl = `https://storage.googleapis.com/corvseller.appspot.com/storesDP/${till.LogoVer}`
            // Use the existing saveImage function from useImageManager
            localImagePath = await saveImage(logoUrl)            
          }
          const processedTill = {
            ...till,
            imagePath: localImagePath,
            localDp: localImagePath
          }
          return processedTill
        } catch (error) {
          console.error(`Failed to process logo for till ${till.id}:`, error)
          return {
            ...till,
            imagePath: null,
            localDp: null
          }
        }
      }))
      return processedTills
    },

    async onlineLogin(username, password, requestType) {
      try {
        // const response = await axios.post(`${BASE_URL}external/login`, { username, password, requestType })
        const response = await axios.post(`getApiUrl('external/login')`, {username, password, requestType})
        const { token } = response.data.body
        const decodedToken = jwtDecode(token)
        
        // Process tills and save their logos
        const processedTills = await this.processTillsWithLogos(decodedToken.tillsD)
        this.tills = processedTills
        await tillsStore.setItem('tills', processedTills)

        // Handle store data
        const storeData = decodedToken.storeD
        if (storeData && storeData.LogoVer) {
          const { saveImage } = useImageManager()
          try {
            // Save store logo locally
             const logoUrl = `https://storage.googleapis.com/corvseller.appspot.com/storesDP/${storeData.LogoVer}`
             const localImagePath = await saveImage(logoUrl)
            // Update store data with local logo path
            storeData.imagePath= localImagePath,
            storeData.localDp= localImagePath
          } catch (logoError) {
            console.error('Failed to save store logo:', logoError)
          }
        }
        this.activeStoreD = storeData

        // Handle users data
        const updatedUsers = await this.updateUsers(decodedToken.usersD)
        this.usersD = updatedUsers
        const user = updatedUsers.find(user => user.username === username) || null
        this.userD = user
        await this.setAuthData(user)

        return true
      } catch (error) {
        console.error('Login failed:', error)
        this.swalError("error", error.response?.data?.body || 'Login failed')
        return false
      }
    },
    async offlineLogin(username, password) {
      try {
        const user = await userStore.getItem(username);
        // console.log(user)
        if (user && user.password) {
          const isValid = await window.electronAPI.verifyPassword(user.password, password);
          if (isValid) {
            await this.setAuthData(user);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Error during offline login:', error);
        return false;
      }
    },
    async setAuthData(userD) {
      this.userD = userD;
      await userStore.setItem('currentUser', userD);
    },
    async logout() {
      this.userD = null;
      delete axios.defaults.headers.common['Authorization'];
      await userStore.removeItem('currentUser');
    },
    async getUserFromLocalForage() {
      return await userStore.getItem('currentUser');
    },
    async initializeAuth() {
      try {
        const userData = await this.getUserFromLocalForage();
        if (userData) {
          this.userD = userData;
          return userData;
        }
       // Get other users and update usersD state
      const otherUsers = await this.getAllUsersExceptCurrent()
      if (otherUsers && otherUsers.length > 0) {
        this.usersD = otherUsers
      }
      return userData || null
        // return null;
      } catch (error) {
        console.error('Error initializing user:', error);
        this.swalError("error", "Failed to initialize user");
        return null;
      }
    },
    
  }
})
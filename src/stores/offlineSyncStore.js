// src/stores/offlineSyncStore.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useLoaderStore } from './loader'
import { useAuthStore } from './auth'
import { useOnlineStatusStore } from './online-status'
import { config, getApiUrl } from '@/config';
import localForage from 'localforage'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const offlineInvoicesStore = localForage.createInstance({
  name: 'corvsellerDB',
  storeName: 'offlineInvoices'
})
const openBalanceStore = localForage.createInstance({
  name: 'corvsellerDB',
  storeName: 'offlineBalance'
})

export const useOfflineSyncStore = defineStore('offlineSync', {
  state: () => ({
    offlineInvoicesCount: 0,
    isSyncing: false,
    lastSyncTime: null,
    productsStore: localForage.createInstance({
      name: 'corvsellerDB',
      storeName: 'products'
    }),
    balanceStore: openBalanceStore,
    fetchInterval: null,
    isFetching: false,
    FETCH_INTERVAL_MS: 60000,
  }),

  getters: {
    hasPendingInvoices: (state) => state.offlineInvoicesCount > 0,
    getSyncStatus: (state) => ({
      isSyncing: state.isSyncing,
      lastSyncTime: state.lastSyncTime,
      pendingCount: state.offlineInvoicesCount
    })
  },

  actions: {
    async swalSuccess (title, msg, showConfirmButton, confirmButtonText) {
      Swal.fire({
          icon: 'success',
          title: title,
          html: `<span style="color:#2C2; background-color:#EFE; padding:10px; margin-top:5px; border:1px solid #ACA; border-radius:10px; line-height:100px;">
                  <b>${msg}</b></span>`,
          showConfirmButton: showConfirmButton,
          confirmButtonText: confirmButtonText,
          reverseButtons: true,
          showCloseButton: true,
          allowOutsideClick: false
      });
    },
    async swalWarning(title, msg) {
      Swal.fire({
        icon: 'warning',
        title: title,
        html: `<span style="color:#F90; background-color:#FFC; padding:10px; margin-top:5px; border:1px solid #CC9; border-radius:10px; line-height:100px;">
                <b>${msg}</b></span>`,
        showConfirmButton: true,
        confirmButtonText: 'OK',
        showCloseButton: true
      })
    },

    async swalError(title, msg) {
      Swal.fire({
        icon: 'error',
        title: title,
        html: msg,
        showConfirmButton: false,
        showCloseButton: true,
        allowOutsideClick: false
      })
    },

    // Add new actions for periodic sync
    async fetchUpdatedData(type) {
      if (this.isFetching) return
      const loaderStore = useLoaderStore()
      const authStore = useAuthStore()
      const onlineStatusStore = useOnlineStatusStore()
      
      if (type === 'syncNow') loaderStore.showLoader()
      
      try {
        this.isFetching = true
        await onlineStatusStore.initializeOnlineStatus()
        
        if (!onlineStatusStore.online) {
          if (type === 'syncNow') {
            this.swalError('Synchronization failed', 'No Internet, Will Sync Later When Internet is Back!')
          }
          return
        }

        await this.fetchUpdatedStocks(type)
        // Get offline data
        const [offlineInvoices, offlineBalance] = await Promise.all([
          this.getOfflineInvoices(),
          this.getOfflineBalance()
        ])

        // Prepare sync operations
        const syncOperations = []
        if (offlineInvoices.length > 0) {
          // console.log("Adding invoice sync operation")
          syncOperations.push(this.syncOfflineInvoices(type))
        }
        if (offlineBalance.length > 0) {
          // console.log("Adding balance sync operation")
          syncOperations.push(this.syncOfflineBalance(type))
        }

        // Execute sync operations in parallel
        await Promise.all(syncOperations)
        
        if (type === 'syncNow') {
          await authStore.loadUsers("logedIn")
          this.swalSuccess('Synchronized!', 'Uploaded/Downloaded', false, false)
        }
      } catch (error) {
        console.error('Fetch updated data error:', error)
        if (type === 'syncNow') {
          this.swalError('Synchronization Error', 'An error occurred during synchronization!')
        }
      } finally {
        this.isFetching = false
        loaderStore.hideLoader()
      }
    },

    startPeriodicFetch() {
      this.fetchUpdatedData('periodic') // Initial fetch
      this.fetchInterval = setInterval(() => {
        this.fetchUpdatedData('periodic')
      }, this.FETCH_INTERVAL_MS)
    },

    stopPeriodicFetch() {
      if (this.fetchInterval) {
        clearInterval(this.fetchInterval)
        this.fetchInterval = null
      }
    },

    async clearLocalForageProducts() {
      try {
        await this.productsStore.removeItem('products')
        console.log('Products cleared successfully')
      } catch (error) {
        console.error('Error clearing products from localForage:', error)
      }
    },

    async fetchAllStocksAndSave(type) {
      const authStore = useAuthStore()
      const onlineStatusStore = useOnlineStatusStore()
      
      const user = authStore.getUser
      const store = authStore.getStoreD

      if (!user.roles.includes('sales-rep') && 
          !(user.roles.includes('cashier') && store.dedicatedCashier === '0')) {
        return
      }

      let bigDifference = false

      try {
        if (onlineStatusStore.online) {
          if (type === 'fresh') {
            const offlineProducts = await this.getProductsFromLocalForage()
            const offlineProductsCount = offlineProducts.length

            const responseCount = await axios.get(getApiUrl('stock/countAllStock'), {
              params: {
                storeID: store.id,
                userID: user.id,
                counted: offlineProductsCount,
              },
            })

            bigDifference = responseCount.data.body.diff

            if (bigDifference) {
              await axios.post(getApiUrl('stock/resetAllStock'), {
                storeID: store.id,
                userID: user.id,
              })
            }
          } else if (type === 'reset') {
            await axios.post(getApiUrl('stock/resetAllStock'), {
              storeID: store.id,
              userID: user.id,
            })
            bigDifference = true
          }

          if (bigDifference) {
            await this.clearLocalForageProducts()
          }

          // Fetch products and save them to localForage
          const pageSize = 1000
          let offset = 0
          let products = []
          const noNegativeQty = (store.Settings?.SalesQty === 'Y') ? "false" : "true"
          const noExpired = (store.Settings?.SalesExp === 'Y') ? "false" : "true"

          while (true) {
            try {
              const responseFetch = await axios.get(getApiUrl('stock/fetchAllStock'), {
                params: {
                  needle: '',
                  storeID: store.id,
                  userID: user.id,
                  offset: offset,
                  rowCount: pageSize,
                  chkEXP: false,
                  chkStockQty: true,
                  noNegativeQty,
                  noExpired,
                },
              })

              const batch = responseFetch.data.body.data.map(item => {
                try {
                  const d = JSON.parse(item.description)
                  const description = (Array.isArray(d) && d.length === 0) || 
                                    (d && typeof d === 'object' && Object.values(d).every(value => value === '')) 
                                    ? '' : d.other || ''
                  
                  return {
                    brand: item.brand,
                    description,
                    descriptionAll: d,
                    discounts: item.discounts ? JSON.parse(item.discounts) : [],
                    expiryDate: item.expiryDate,
                    generics: (item.generics !== '[]' && item.generics !== '[""]') ? JSON.parse(item.generics) : null,
                    manufacturer: item.manufacturer,
                    productCode: item.productCode,
                    productType: item.productType,
                    costPrice: parseFloat(item.costPrice),
                    sellingPrice: parseFloat(item.sellingPrice),
                    discounted: parseFloat(item.sellingPrice),
                    SID: parseInt(item.SID),
                    stockIn: item.stockIn,
                    stockQty: parseInt(item.stockQty),
                    stockVersion: item.stockVersion,
                    isActive: item.isActive,
                    Sub: parseFloat(item.sellingPrice),
                    qty: 1,
                  }
                } catch (error) {
                  console.error(`Error parsing item with SID ${item.SID}:`, error)
                  return null
                }
              })

              const filteredBatch = batch.filter(item => item !== null)
              
              if (filteredBatch.length === 0) {
                break
              }

              products = products.concat(filteredBatch)
              offset += pageSize
            } catch (error) {
              console.error('Error fetching stock:', error)
              break
            }
          }

          await this.saveProductsToLocalForage(products)
        }
      } catch (error) {
        console.error('Error in fetchAllStocksAndSave:', error)
        throw error
      }
    },

    async getOfflineBalance() {
      try {
        const keys = await this.balanceStore.keys()
        // console.log("Balance store keys:", keys) // Add this
    
        const balances = await Promise.all(
          keys.map(async key => {
            const balance = await this.balanceStore.getItem(key)
            // console.log(`Balance for key ${key}:`, balance) // Add this
            if (!balance) console.warn(`No balance found for key: ${key}`)
            return balance
          })
        )
        const filteredBalances = balances.filter(Boolean)
        // console.log("Filtered balances:", filteredBalances) // Add this
        return filteredBalances
      } catch (error) {
        console.error('Error retrieving offline balances:', error)
        throw error
      }
    },

    async syncOfflineBalance(type) {
      const loaderStore = useLoaderStore()
      try {
        const offlineBalance = await this.getOfflineBalance()
        console.log("offlineBalance.lenght",offlineBalance)
        if (offlineBalance.length === 0) return

        if (type === 'syncNow') loaderStore.showLoader()

        let successCount = 0
        let failCount = 0

        for (const balance of offlineBalance) {
          try {
            await this.syncSingleOfflineBalance(balance)
            successCount++
          } catch (error) {
            failCount++
            console.error(`Failed to sync balance ${balance.uniqueID}:`, error)
          }
        }

        loaderStore.hideLoader()

        if (failCount > 0) {
          const msg = `Successfully synced ${successCount} Balances. Failed to sync ${failCount} Balances.`
          this.swalWarning('Sync Partially Complete', msg)
        }
      } catch (error) {
        loaderStore.hideLoader()
        console.error('Error in syncOfflineBalance:', error.toString())
        this.swalError('Could Not Sync!', error.toString())
      }
    },

    async syncSingleOfflineBalance(offlineBalance, retries = 3) {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await axios.post(
            getApiUrl('till/syncOfflineBalance'),
            offlineBalance
          )

          if (response.data.body.status === 'success') {
            await this.removeSyncedBalance(
              response.data.body.data.uniqueID,
              offlineBalance
            )
            return true
          } else {
            console.warn(
              `Sync failed for balance ${offlineBalance.uniqueID}: ${response.data.body.message}`
            )
          }
        } catch (error) {
          if (attempt === retries) {
            console.error(
              `Failed to sync balance ${offlineBalance.uniqueID} after ${retries} attempts:`,
              error
            )
            throw error
          }
          console.warn(
            `Sync attempt ${attempt} failed for balance ${offlineBalance.uniqueID}. Retrying...`
          )
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    },

    async removeSyncedBalance(uniqueID, data) {
      if (!uniqueID) {
        console.error('Invalid uniqueID provided to removeSyncedBalance')
        return
      }

      try {
        if (data.isActive === 1) {
          await this.balanceStore.removeItem(uniqueID)
          console.log(`Successfully removed synced balance with ID ${uniqueID}`)
        } else {
          console.log(
            `Skipped removing balance ${uniqueID} - still active (isActive: ${data.isActive})`
          )
        }
      } catch (error) {
        console.error(`Error removing synced balance with ID ${uniqueID}:`, error)
        throw error
      }
    },

    async getOfflineInvoices() {
      try {
        const keys = await offlineInvoicesStore.keys()
        const invoices = await Promise.all(
          keys.map(async key => {
            const invoice = await offlineInvoicesStore.getItem(key)
            if (!invoice) console.warn(`No invoice found for key: ${key}`)
            return invoice
          })
        )
        console.log(`Retrieved ${invoices.filter(Boolean).length} invoices`)
        return invoices.filter(Boolean)
      } catch (error) {
        console.error('Error retrieving offline invoices:', error)
        throw error
      }
    },

    async syncOfflineInvoices(type) {
      if (this.isSyncing) return

      const loaderStore = useLoaderStore()
      
      try {
        this.isSyncing = true
        const offlineInvoices = await this.getOfflineInvoices()
        
        if (offlineInvoices.length === 0) {
          this.isSyncing = false
          return
        }

        if (type === 'syncNow') loaderStore.showLoader()

        let successCount = 0
        let failCount = 0

        for (const invoice of offlineInvoices) {
          try {
            await this.syncSingleOfflineInvoice(invoice)
            successCount++
          } catch (error) {
            failCount++
            console.error(`Failed to sync invoice ${invoice.uniqueID}:`, error)
          }
        }

        this.lastSyncTime = new Date()
        
        if (type === 'syncNow') loaderStore.hideLoader()
        
        if (failCount > 0) {
          const msg = `Successfully synced ${successCount} invoices. Failed to sync ${failCount} invoices.`
          this.swalWarning('Sync Partially Complete', msg)
        }
        
      } catch (error) {
        if (type === 'syncNow') loaderStore.hideLoader()
        console.error('Error in syncOfflineInvoices:', error.toString())
        this.swalError('Could Not Sync!', error.toString())
      } finally {
        this.isSyncing = false
      }
    },

    async syncSingleOfflineInvoice(offlineInvoice, retries = 3) {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await axios.post(
            getApiUrl('invoices/syncOfflineInvoices'),
            offlineInvoice
          )

          if (response.data.body.status === 'success') {
            await this.removeSyncedInvoice(response.data.body.uniqueID)
            return true
          }

          console.warn(`Sync failed for invoice ${offlineInvoice.uniqueID}: ${response.data.body.message}`)
          
        } catch (error) {
          if (attempt === retries) {
            throw error
          }
          console.warn(`Sync attempt ${attempt} failed for invoice ${offlineInvoice.uniqueID}. Retrying...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    },

    async removeSyncedInvoice(uniqueID) {
      if (!uniqueID) {
        console.error('Invalid uniqueID provided to removeSyncedInvoice')
        return
      }
      
      try {
        await offlineInvoicesStore.removeItem(uniqueID)
        this.offlineInvoicesCount -= 1
        console.log(`Successfully removed synced invoice with ID ${uniqueID}`)
      } catch (error) {
        console.error(`Error removing synced invoice with ID ${uniqueID}:`, error)
        throw error
      }
    },

    async initializeOfflineSync() {
      try {
        const keys = await offlineInvoicesStore.keys()
        this.offlineInvoicesCount = keys.length
        return true
      } catch (error) {
        console.error('Error initializing offline sync:', error)
        return false
      }
    },
    async saveProductsToLocalForage(products) {
      try {
        await this.productsStore.setItem('products', products)
        console.log('Products saved successfully')
      } catch (error) {
        console.error('Error saving products:', error)
        throw error
      }
    },

    async getProductsFromLocalForage() {
      try {
        const products = await this.productsStore.getItem('products')
        return products || []
      } catch (error) {
        console.error('Error getting products:', error)
        throw error
      }
    },

    async fetchUpdatedStocks(type) {
      const authStore = useAuthStore()
      const loaderStore = useLoaderStore()
      const onlineStatusStore = useOnlineStatusStore()
      const user = authStore.getUser
      const store = authStore.getStoreD
      if (!user.roles.includes('sales-rep') && 
          !(user.roles.includes('cashier') && store.dedicatedCashier === '0')) {
        return
      }
      await onlineStatusStore.initializeOnlineStatus()
      
      if (!onlineStatusStore.online) {
        return
      }
      if (type === 'syncNow') loaderStore.showLoader()
      const pageSize = 200
      let offset = 0
      const noNegativeQty = (store.Settings?.SalesQty === 'Y') ? "false" : "true"
      const noExpired = (store.Settings?.SalesExp === 'Y') ? "false" : "true"
      try {
        const response = await axios.get(getApiUrl('stock/fetchUpdatedStock'), {
          params: {
            storeID: store.id,
            userID: user.id,
            noNegativeQty,
            noExpired,
            offset,
            rowCount: pageSize,
          },
        })
        loaderStore.hideLoader()
        const fetchedStocks = response.data.body.data
          .map(item => {
            try {
              const d = JSON.parse(item.description)
              const description = (Array.isArray(d) && d.length === 0) || 
                                (d && typeof d === 'object' && Object.values(d).every(value => value === '')) 
                                ? '' : d.other || ''
              
              return {
                brand: item.brand,
                description,
                descriptionAll: d,
                discounts: item.discounts ? JSON.parse(item.discounts) : [],
                expiryDate: item.expiryDate,
                generics: (item.generics !== '[]' && item.generics !== '[""]') ? JSON.parse(item.generics) : null,
                manufacturer: item.manufacturer,
                productCode: item.productCode,
                productType: item.productType,
                costPrice: parseFloat(item.costPrice),
                sellingPrice: parseFloat(item.sellingPrice),
                discounted: parseFloat(item.sellingPrice),
                SID: parseInt(item.SID),
                stockIn: item.stockIn,
                stockQty: parseInt(item.stockQty),
                stockVersion: item.stockVersion,
                isActive: item.isActive,
                Sub: parseFloat(item.sellingPrice),
                qty: 1,
              }
            } catch (error) {
              console.error(`Error parsing item with SID ${item.SID}:`, error)
              return null
            }
          })
          .filter(item => item !== null)

        if (fetchedStocks.length > 0) {
          const existingProducts = await this.getProductsFromLocalForage()
          
          const updatedProducts = existingProducts.map(existingProduct => {
            const matchingStock = fetchedStocks.find(stock => stock.SID === existingProduct.SID)
            return matchingStock || existingProduct
          })

          // Add new products
          fetchedStocks.forEach(stock => {
            if (!existingProducts.some(existing => existing.SID === stock.SID)) {
              updatedProducts.push(stock)
            }
          })

          // Filter active products
          const finalUpdatedProducts = updatedProducts.filter(stock => stock.isActive === '1')
          
          await this.saveProductsToLocalForage(finalUpdatedProducts)
        }
      } catch (error) {
        loaderStore.hideLoader()
        this.swalError('Could Not Download Updates!', error.toString())
        console.error('Error fetching updated stocks:', error)
        throw error
      }
    },

  }
})
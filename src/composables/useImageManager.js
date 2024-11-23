// src/composables/useImageManager.js
import { ref } from 'vue';
import localForage from 'localforage';
export function useImageManager() {
  const imageCache = ref(new Map());
  const imageStore = localForage.createInstance({
    name: 'corvsellerDB',
    storeName: 'storeImages'
  });
  const generateFileName = (url,name) => {
    const ext = url.split('.').pop().split(/[#?]/)[0];
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
  };
  const saveImage = async (imageUrl) => {
    try {
      // Check if image is already cached
      const cachedPath = await imageStore.getItem(`image-${imageUrl}`);
      if (cachedPath) {
        return cachedPath;
      }
      // Generate unique filename
      const fileName = generateFileName(imageUrl,name);
      // Save image locally through Electron
      const localPath = await window.electronAPI.saveImageLocally(imageUrl, fileName);
      // Save mapping in LocalForage
      await imageStore.setItem(`image-${imageUrl}`, localPath);
      // Update cache
      imageCache.value.set(imageUrl, localPath);
      return localPath;
    } catch (error) {
      console.error('Error saving image:', error);
      return imageUrl; // Fallback to original URL
    }
  };

  const getStoreLogo = async (image) => {
    try {
      // Check memory cache first 
      const imageUrl = `https://storage.googleapis.com/corvseller.appspot.com/storesDP/${image}`
      if (imageCache.value.has(imageUrl)) {
        console.log("imageCache has value")
        return imageCache.value.get(imageUrl);
      }
      // Check LocalForage
      const cachedPath = await imageStore.getItem(`image-${imageUrl}`);
      if (cachedPath) {
        const exists = await window.electronAPI.getLocalImage(
          cachedPath.replace('local-image://', '')
        );
        if (exists) {
          console.log("exit")
          imageCache.value.set(imageUrl, cachedPath);
          return cachedPath;
        }
      }
      // If not found, save it
      return await saveImage(imageUrl);
    } catch (error) {
      console.error('Error getting image:', error);
      return imageUrl; // Fallback to original URL
    }
  };
  // const getUserProfileImage = async (imageUrl, username) => {
  //   try {
  //     // Check memory cache first
  //     if (imageCache.value.has(imageUrl)) {
  //       return imageCache.value.get(imageUrl)
  //     }

  //     // Check LocalForage
  //     const cachedPath = await imageStore.getItem(`profile-${username}`)
  //     if (cachedPath) {
  //       // Verify file still exists
  //       const exists = await window.electronAPI.getLocalImage(
  //         cachedPath.replace('local-image://', '')
  //       )
  //       if (exists) {
  //         imageCache.value.set(imageUrl, cachedPath)
  //         return cachedPath
  //       }
  //     }

  //     // If not found, save it
  //     const fileName = `profile-${username}-${Date.now()}.${imageUrl.split('.').pop().split(/[#?]/)[0]}`
  //     const localPath = await window.electronAPI.saveImageLocally(imageUrl, fileName)
      
  //     // Save mapping in LocalForage
  //     await imageStore.setItem(`profile-${username}`, localPath)
  //     imageCache.value.set(imageUrl, localPath)
      
  //     return localPath
  //   } catch (error) {
  //     console.error('Error getting user profile image:', error)
  //     return imageUrl // Fallback to original URL
  //   }
  // };

  // const getAllImages = async () => {
  //   return await window.electronAPI.getAllLocalImages();
  // };

  const removeImage = async (imageUrl) => {
    try {
      const cachedPath = await imageStore.getItem(`image-${imageUrl}`);
      if (cachedPath) {
        await window.electronAPI.removeLocalImage(
          cachedPath.replace('local-image://', '')
        );
        await imageStore.removeItem(`image-${imageUrl}`);
        imageCache.value.delete(imageUrl);
      }
      return true;
    } catch (error) {
      console.error('Error removing image:', error);
      return false;
    }
  };

  return {
    saveImage,
    getStoreLogo,
    // getAllImages,
    removeImage,
    // getUserProfileImage,
  };
}
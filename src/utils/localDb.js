// Simple IndexedDB wrapper for saving discussions locally
// Uses idb-keyval for simplicity if available, otherwise fallback to basic IndexedDB

export function saveDiscussionToDb(discussion) {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject('IndexedDB not supported');
      return;
    }
    const request = window.indexedDB.open('movacash_forum', 1);
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('discussions')) {
        db.createObjectStore('discussions', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = function (event) {
      const db = event.target.result;
      const tx = db.transaction('discussions', 'readwrite');
      const store = tx.objectStore('discussions');
      store.add(discussion);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function (e) { reject(e); };
    };
    request.onerror = function (e) { reject(e); };
  });
}

export function getAllDiscussionsFromDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject('IndexedDB not supported');
      return;
    }
    const request = window.indexedDB.open('movacash_forum', 1);
    request.onsuccess = function (event) {
      const db = event.target.result;
      const tx = db.transaction('discussions', 'readonly');
      const store = tx.objectStore('discussions');
      const getAllReq = store.getAll();
      getAllReq.onsuccess = function () { resolve(getAllReq.result); };
      getAllReq.onerror = function (e) { reject(e); };
    };
    request.onerror = function (e) { reject(e); };
  });
}

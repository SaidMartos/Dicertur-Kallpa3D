// config.js

const appId = (typeof __app_id !== 'undefined' && __app_id) ? String(__app_id) : 'github-pages-default-id';

const LOCAL_FIREBASE_CONFIG = {
    apiKey: "AIzaSyBifMbYtOkxsijnaKlTtl_S_A5dkzE32BM",
    authDomain: "prueba-ff7bb.firebaseapp.com",
    projectId: "prueba-ff7bb",
    storageBucket: "prueba-ff7bb.appspot.com",
    messagingSenderId: "700600586061",
    appId: "1:700600586061:web:f1bfae76ae2ff3ed1db104"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' && JSON.parse(__firebase_config).projectId
    ? JSON.parse(__firebase_config)
    : LOCAL_FIREBASE_CONFIG;

export { firebaseConfig, appId };
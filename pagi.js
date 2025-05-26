// ==UserScript==
// @name         פאג"י אוטומטי-טופס כניסה
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  התחברות אוטומטית לפאג"י-ישירות לטופס כניסה
// @match        https://online.pagi.co.il/MatafLoginService/MatafLoginServlet*
// @updateURL    https://srulikenig.github.io/ydf/pagi.js
// @downloadURL  https://srulikenig.github.io/ydf/pagi.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const key = "mySecretKey"; // המפתח שאתה משתמש בו להצפנה/פענוח

    // שליפת ydf מתוך כתובת ה-URL
    const hash = window.location.hash;
    const queryString = hash.includes('#') ? hash.split('#')[1] : '';
    const params = new URLSearchParams(queryString);
    const ydf = params.get("ydf");

    if (!ydf) return;

    // פענוח Base64Url
    function base64UrlDecode(str) {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        return atob(str);
    }

    // XOR Decryption
    function xorDecrypt(text, key) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return result;
    }

    const decrypted = xorDecrypt(base64UrlDecode(ydf), key);

    let userData;
    try {
        userData = JSON.parse(decrypted);
    } catch (e) {
        console.error("שגיאה בפענוח:", decrypted);
        return;
    }

    const { userName, password, zheut } = userData;

    const waitForElement = (selector) => new Promise((resolve) => {
        const interval = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(interval);
                resolve(el);
            }
        }, 100);
    });

    (async () => {
        const userInput = await waitForElement('#username');
        const passInput = await waitForElement('#password');
        const loginBtn = await waitForElement('#continueBtn');

        userInput.value = userName;
        userInput.dispatchEvent(new Event('input', { bubbles: true }));

        passInput.value = password;
        passInput.dispatchEvent(new Event('input', { bubbles: true }));

        // לחץ על כניסה
        loginBtn.click();
    })();
})();

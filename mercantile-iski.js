// ==UserScript==
// @name         מרכנתיל עסקי אוטומטי
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  התחברות אוטומטית למרכנתיל עסקי
// @match        https://start.telebank.co.il/login/*
// @updateURL    https://srulikenig.github.io/ydf/mercantile-iski.js
// @downloadURL  https://srulikenig.github.io/ydf/mercantile-iski.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (!location.href.includes('LOGIN_PAGE_SME')) return;
    console.log("script----2")

    const key = "mySecretKey"; // אותו מפתח כמו באקסל

    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    const ydf = params.get("ydf");

    if (!ydf) return;

    function base64UrlDecode(str) {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        return atob(str);
    }

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
        const idInput = await waitForElement('#tzId');          // מספר זהות
        const passInput = await waitForElement('#tzPassword');  // סיסמה

        idInput.value = zheut;
        idInput.dispatchEvent(new Event('input', { bubbles: true }));

        passInput.value = password;
        passInput.dispatchEvent(new Event('input', { bubbles: true }));

        const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]'))
            .find(el => el.innerText.trim() === 'כניסה');

        if (submitBtn) submitBtn.click();
    })();
})();

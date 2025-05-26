// ==UserScript==
// @name         מרכנתיל אוטומטי
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  התחברות אוטומטית לבנק מרכנתיל
// @match        https://start.telebank.co.il/login/*
// @updateURL    https://srulikenig.github.io/ydf/mercantile.js
// @downloadURL  https://srulikenig.github.io/ydf/mercantile.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const key = "mySecretKey"; // אותו מפתח כמו באקסל

    const params = new URLSearchParams(window.location.search);
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
        const idInput = await waitForElement('#tzId');
        const userInput = await waitForElement('#aidnum');
        const passInput = await waitForElement('#tzPassword');

        idInput.value = zheut;
        idInput.dispatchEvent(new Event('input', { bubbles: true }));

        userInput.value = userName;
        userInput.dispatchEvent(new Event('input', { bubbles: true }));

        passInput.value = password;
        passInput.dispatchEvent(new Event('input', { bubbles: true }));

        const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]'))
            .find(el => el.innerText.trim() === 'כניסה');

        if (submitBtn) submitBtn.click();
    })();
})();

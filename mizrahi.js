// ==UserScript==
// @name         מזרחי טפחות אוטומטי
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  התחברות אוטומטית למזרחי טפחות עם פרמטר ydf מוצפן
// @match        https://www.mizrahi-tefahot.co.il/login/*
// @updateURL    https://srulikenig.github.io/ydf/mizrahi.js
// @downloadURL  https://srulikenig.github.io/ydf/mizrahi.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

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

    const { userName, password } = userData;

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
        const userInput = await waitForElement('#emailDesktopHeb');
        const passInput = await waitForElement('#passwordIDDesktopHEB');

        //const userInput = await waitForElement('#input_user');
        //const passInput = await waitForElement('#input_pass');

        userInput.value = userName;
        userInput.dispatchEvent(new Event('input', { bubbles: true }));

        passInput.value = password;
        passInput.dispatchEvent(new Event('input', { bubbles: true }));

        const submitBtn = Array.from(document.querySelectorAll('button'))
        .find(el => el.innerText.trim() === 'כניסה');

        if (submitBtn) submitBtn.click();

        /*
        const submitBtn = Array.from(document.querySelectorAll('button[type="button"]'))
            .find(el => el.innerText.includes('כניסה לחשבון'));

        if (submitBtn) submitBtn.click();
        */
    })();
})();

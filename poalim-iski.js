// ==UserScript==
// @name         פועלים עסקים אוטומטי
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  התחברות אוטומטית לבנק הפועלים עסקים
// @match        https://biz2.bankhapoalim.co.il/ng-portals/auth/he/biz-login/authenticate*
// @updateURL    https://srulikenig.github.io/ydf/poalim-iski.js
// @downloadURL  https://srulikenig.github.io/ydf/poalim-iski.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const key = "mySecretKey"; // אותו מפתח ששימש להצפנה באקסל

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
        console.error("שגיאה בפענוח המידע:", decrypted);
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
        const userInput = await waitForElement('#user-code');
        const passInput = await waitForElement('#password');

        userInput.value = userName;
        userInput.dispatchEvent(new Event('input', { bubbles: true }));

        passInput.value = password;
        passInput.dispatchEvent(new Event('input', { bubbles: true }));

        const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]'))
            .find(el => el.innerText.trim() === 'כניסה');

        if (submitBtn) submitBtn.click();
    })();
})();

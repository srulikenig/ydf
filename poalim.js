
// ==UserScript==
// @name         פועלים אוטומטי
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  הכנסת פרטי התחברות אוטומטית לבנק הפועלים
// @match        https://login.bankhapoalim.co.il/ng-portals/auth/he/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const key = "mySecretKey"; // זהה למפתח שבחרת באקסל

    // בדיקה אם ה-URL מכיל את הפרמטר ydf
    const params = new URLSearchParams(window.location.search);
    const ydf = params.get("ydf");
    if (!ydf) return;

    // פענוח Base64-url (המרה הפוכה לגרסה תקינה של base64)
    function base64UrlDecode(str) {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        return atob(str);
    }

    // XOR פענוח עם מפתח
    function xorDecrypt(text, key) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const decryptedChar = String.fromCharCode(
                text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
            result += decryptedChar;
        }
        return result;
    }

    const encrypted = base64UrlDecode(ydf);
    const decryptedJson = xorDecrypt(encrypted, key);

    let userData;
    try {
        userData = JSON.parse(decryptedJson);
    } catch (e) {
        console.error("Failed to parse user data:", decryptedJson);
        return;
    }

    const { userName, password } = userData;

    // מוודא שהדף והאינפוטים מוכנים
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
        const userCodeInput = await waitForElement('#userCode');
        const passwordInput = await waitForElement('#password');

        userCodeInput.value = userName;
        userCodeInput.dispatchEvent(new Event('input', { bubbles: true }));

        passwordInput.value = password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

        const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]'))
            .find(el => el.innerText.trim() === 'כניסה');

        if (submitBtn) submitBtn.click();

    })();
})();

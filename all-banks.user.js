// ==UserScript==
// @name         ydf Auto Login
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  התחברות אוטומטית לכל הבנקים (מרכנתיל, פועלים, פאג"י, מזרחי) עם ydf מוצפן
// @match        https://start.telebank.co.il/login/*
// @match        https://login.bankhapoalim.co.il/ng-portals/auth/he/*
// @match        https://biz2.bankhapoalim.co.il/ng-portals/auth/he/biz-login/authenticate*
// @match        https://online.pagi.co.il/MatafLoginService/MatafLoginServlet*
// @match        https://www.mizrahi-tefahot.co.il/login/*
// @match        https://hb2.bankleumi.co.il/staticcontent/gate-keeper/he/*
// @updateURL    https://srulikenig.github.io/ydf/all-banks.js
// @downloadURL  https://srulikenig.github.io/ydf/all-banks.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const key = "mySecretKey"; // אותו מפתח כמו באקסל

    // עוזר: פענוח base64-url
    function base64UrlDecode(str) {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        return atob(str);
    }

    // עוזר: XOR פענוח
    function xorDecrypt(text, key) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return result;
    }

    // עוזר: המתנה לאלמנט
    function waitForElement(selector) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearInterval(interval);
                    resolve(el);
                }
            }, 100);
        });
    }

    // עוזר: שליפת ydf מה-URL (search או hash)
    function getYdfParam({ preferHash = false } = {}) {
        let ydf = null;
        if (preferHash) {
            const hash = window.location.hash;
            const queryString = hash.includes('?') ? hash.split('?')[1] : '';
            const params = new URLSearchParams(queryString);
            ydf = params.get("ydf");
        } else {
            const params = new URLSearchParams(window.location.search);
            ydf = params.get("ydf");
        }
        // fallback: נסה גם ב-hash אם לא נמצא
        if (!ydf) {
            const hash = window.location.hash;
            const queryString = hash.includes('?') ? hash.split('?')[1] : '';
            const params = new URLSearchParams(queryString);
            ydf = params.get("ydf");
        }
        // fallback: נסה גם ב-hash אחרי #
        if (!ydf) {
            const hash = window.location.hash;
            const queryString = hash.includes('#') ? hash.split('#')[1] : '';
            const params = new URLSearchParams(queryString);
            ydf = params.get("ydf");
        }
        return ydf;
    }

    const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

     function setReactInputValue(element, value) {
         // שלב א': משיגים את ה-'setter' של הערך מהפרוטוטייפ של שדה קלט
         const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

         // שלב ב': מפעילים את ה-'setter' על האלמנט עם הערך החדש
         valueSetter.call(element, value);

         // שלב ג': יוצרים ומפעילים אירוע 'input' כדי שהאתר (React) יגיב לשינוי
         const event = new Event('input', { bubbles: true });
         element.dispatchEvent(event);
     }

    // --- מרכנתיל עסקי ---
    if (location.hostname === "start.telebank.co.il" && location.href.includes('LOGIN_PAGE_SME')) {
        const ydf = getYdfParam({ preferHash: true });
        if (!ydf) return;

        let userData;
        try {
            userData = JSON.parse(xorDecrypt(base64UrlDecode(ydf), key));
        } catch (e) {
            console.error("שגיאה בפענוח:", e);
            return;
        }
        const { password, zheut } = userData;

        (async () => {
            const idInput = await waitForElement('#tzId');
            const passInput = await waitForElement('#tzPassword');

            idInput.value = zheut;
            idInput.dispatchEvent(new Event('input', { bubbles: true }));

            passInput.value = password;
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]'))
                .find(el => el.innerText.trim() === 'כניסה');
            if (submitBtn) submitBtn.click();
        })();
        return;
    }

    // --- מרכנתיל רגיל ---
    if (location.hostname === "start.telebank.co.il") {
        const ydf = getYdfParam();
        if (!ydf) return;

        let userData;
        try {
            userData = JSON.parse(xorDecrypt(base64UrlDecode(ydf), key));
        } catch (e) {
            console.error("שגיאה בפענוח:", e);
            return;
        }
        const { userName, password, zheut } = userData;

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
        return;
    }

    // --- פועלים רגיל ---
    if (location.hostname === "login.bankhapoalim.co.il") {
        const ydf = getYdfParam();
        if (!ydf) return;

        let userData;
        try {
            userData = JSON.parse(xorDecrypt(base64UrlDecode(ydf), key));
        } catch (e) {
            console.error("Failed to parse user data:", e);
            return;
        }
        const { userName, password } = userData;

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
        return;
    }

    // --- פועלים עסקים ---
    if (location.hostname === "biz2.bankhapoalim.co.il") {
        const ydf = getYdfParam({ preferHash: true });
        if (!ydf) return;

        let userData;
        try {
            userData = JSON.parse(xorDecrypt(base64UrlDecode(ydf), key));
        } catch (e) {
            console.error("שגיאה בפענוח המידע:", e);
            return;
        }
        const { userName, password } = userData;

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
        return;
    }

    // --- פאג"י ---
    if (location.hostname === "online.pagi.co.il") {
        const ydf = getYdfParam({ preferHash: true });
        if (!ydf) return;

        let userData;
        try {
            userData = JSON.parse(xorDecrypt(base64UrlDecode(ydf), key));
        } catch (e) {
            console.error("שגיאה בפענוח:", e);
            return;
        }
        const { userName, password } = userData;

        (async () => {
            const userInput = await waitForElement('#username');
            const passInput = await waitForElement('#password');
            const loginBtn = await waitForElement('#continueBtn');

            userInput.value = userName;
            userInput.dispatchEvent(new Event('input', { bubbles: true }));

            passInput.value = password;
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            loginBtn.click();
        })();
        return;
    }

    // --- מזרחי טפחות ---
    if (location.hostname === "www.mizrahi-tefahot.co.il") {
        const ydf = getYdfParam({ preferHash: true });
        if (!ydf) return;

        let userData;
        try {
            userData = JSON.parse(xorDecrypt(base64UrlDecode(ydf), key));
        } catch (e) {
            console.error("שגיאה בפענוח:", e);
            return;
        }
        const { userName, password } = userData;

        (async () => {
            const userInput = await waitForElement('#emailDesktopHeb');
            const passInput = await waitForElement('#passwordIDDesktopHEB');

            userInput.value = userName;
            userInput.dispatchEvent(new Event('input', { bubbles: true }));

            passInput.value = password;
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            const submitBtn = Array.from(document.querySelectorAll('button'))
                .find(el => el.innerText.trim() === 'כניסה');
            if (submitBtn) submitBtn.click();
        })();
        return;
    }

    // בנק לאומי
    if (location.hostname === "hb2.bankleumi.co.il") {
        const ydf = getYdfParam({ preferHash: true });
        if (!ydf) return;

        let userData;
        try {
            userData = JSON.parse(xorDecrypt(base64UrlDecode(ydf), key));
        } catch (e) {
            console.error("שגיאה בפענוח:", e);
            return;
        }
        const { userName, password } = userData;

        (async () => {
            await sleep(2);

            const userInput = await waitForElement('input[name="user"]');
            const passInput = await waitForElement('input[name="password"]');

            const submitButton = await waitForElement('button[type="submit"]');
            setReactInputValue(userInput, userName);
            setReactInputValue(passInput, password);

            await sleep(2);

            submitButton.click();

        })();
        return;
    }

})();
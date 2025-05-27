// ==UserScript==
// @name         התחברות אוטומטית - כל הבנקים
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  התחברות אוטומטית לכל הבנקים הנתמכים עם פרמטר ydf מוצפן
// @match        https://login.bankleumi.co.il/ng-portals/auth/he/*
// @match        https://hb2.bankleumi.co.il/Banks/Online/HB/LoginPeulotA.asp*
// @match        https://online.fibi.co.il/*
// @match        https://online.pagi.co.il/MatafLoginService/MatafLoginServlet*
// @match        https://biz2.bankhapoalim.co.il/ng-portals/auth/he/biz-login/authenticate*
// @match        https://login.bankhapoalim.co.il/ng-portals/auth/he/*
// @updateURL    https://srulikenig.github.io/ydf/all-banks.user.js
// @downloadURL  https://srulikenig.github.io/ydf/all-banks.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const key = "mySecretKey";

    const locationHref = window.location.href;

    const extractYDF = () => {
        if (window.location.hash.includes('ydf=')) {
            return new URLSearchParams(window.location.hash.split('#')[1]).get("ydf");
        } else {
            return new URLSearchParams(window.location.search).get("ydf");
        }
    };

    const base64UrlDecode = (str) => {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        return atob(str);
    };

    const xorDecrypt = (text, key) => {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return result;
    };

    const waitForElement = (selector) => new Promise((resolve) => {
        const interval = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(interval);
                resolve(el);
            }
        }, 100);
    });

    const ydf = extractYDF();
    if (!ydf) return;

    let userData;
    try {
        const decrypted = xorDecrypt(base64UrlDecode(ydf), key);
        userData = JSON.parse(decrypted);
    } catch (e) {
        console.error("שגיאה בפענוח:", e);
        return;
    }

    const { userName, password, zheut } = userData;

    (async () => {
        // פאג"י
        if (locationHref.includes("pagi.co.il")) {
            const userInput = await waitForElement('#username');
            const passInput = await waitForElement('#password');
            const loginBtn = await waitForElement('#continueBtn');

            userInput.value = userName;
            userInput.dispatchEvent(new Event('input', { bubbles: true }));

            passInput.value = password;
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            loginBtn.click();
        }

        // פועלים עסקים
        else if (locationHref.includes("biz2.bankhapoalim.co.il")) {
            const userInput = await waitForElement('#user-code');
            const passInput = await waitForElement('#password');

            userInput.value = userName;
            userInput.dispatchEvent(new Event('input', { bubbles: true }));

            passInput.value = password;
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]'))
                .find(el => el.innerText.trim() === 'כניסה');

            if (submitBtn) submitBtn.click();
        }

        // פועלים רגיל
        else if (locationHref.includes("login.bankhapoalim.co.il")) {
            const userInput = await waitForElement('#userCode');
            const passInput = await waitForElement('#password');

            userInput.value = userName;
            userInput.dispatchEvent(new Event('input', { bubbles: true }));

            passInput.value = password;
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]'))
                .find(el => el.innerText.trim() === 'כניסה');

            if (submitBtn) submitBtn.click();
        }

        // לאומי (מערכת חדשה)
        else if (locationHref.includes("login.bankleumi.co.il")) {
            const userInput = await waitForElement('#userCode');
            const passInput = await waitForElement('#password');

            userInput.value = userName;
            userInput.dispatchEvent(new Event('input', { bubbles: true }));

            passInput.value = password;
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            const btn = Array.from(document.querySelectorAll('button[type="submit"]'))
                .find(el => el.innerText.includes("כניסה"));
            if (btn) btn.click();
        }

        // לאומי (מערכת ישנה)
        else if (locationHref.includes("hb2.bankleumi.co.il")) {
            const userInput = await waitForElement('input[name="uid"]');
            const passInput = await waitForElement('input[name="password"]');

            userInput.value = userName;
            passInput.value = password;

            const form = document.querySelector('form[name="loginForm"]');
            if (form) form.submit();
        }

        // הבינלאומי
        else if (locationHref.includes("online.fibi.co.il")) {
            const userInput = await waitForElement('#username');
            const passInput = await waitForElement('#password');

            userInput.value = userName;
            userInput.dispatchEvent(new Event('input', { bubbles: true }));

            passInput.value = password;
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            const btn = document.querySelector('button[type="submit"]');
            if (btn) btn.click();
        }

    })();
})();

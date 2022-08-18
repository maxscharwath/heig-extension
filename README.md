![icon](https://user-images.githubusercontent.com/6887819/171869997-3c4e96df-a734-456d-b4d1-771aab90064a.png)

# HEIG-VD Extension

## Download the extension

[![Chrome](https://img.shields.io/badge/Google_chrome-4285F4?style=for-the-badge&logo=Google-chrome&logoColor=white)](https://chrome.google.com/webstore/detail/heig-vd-extension/jomjkahkhblnklhchbifebejlgndmplf)
[![Firefox](https://img.shields.io/badge/Firefox_Browser-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)](https://addons.mozilla.org/fr/firefox/addon/heig-vd-extension/)

This extension is not available anymore on the Firefox store. 

## What can the extension do?

This extension does the following:

- Get all grades from GAPS system.
- Get the menu of the day/week.
- `since version 0.1.0` Chat with connected students in a global room.

## Where my data is stored?
### For sensible data as settings and grades.
The data is stored in a local storage. No data is sent to a server.
All data is stored with ``browser storage API``.
The data is compressed so you cannot access it directly.
### For the chat system and menu grades.
The data is stored in a decentralized database. see [gun.eco]("https://gun.eco/") for more information.
To use the chat system, you need to be connected with your credentials.
The chat system is a friendly place to chat and shares jokes, not to be used for discrimination. 
The chat system is not anonymous.

## How to use the extension?

You can use the extension with two ways:

- The first way is to use the extension without storing your credentials.
  The extension will try to get the grades from the GAPS if you are already connected to GAPS website.
- The second way is to use the extension with storing your credentials. So if you are disconnected from GAPS website,
  the extension will try to log for you with your credentials.

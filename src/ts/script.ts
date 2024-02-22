import Info from "./modules/Info";
import UpdateJishoAPI from "../../module/unofficial-jisho-api-master";
import { DataProcessor } from "./classes/DataProcessor";

const jisho = new UpdateJishoAPI();
const dataProcessor = new DataProcessor();

declare global {
  interface Window {
    APP: any;
  }
}
export const APP = window.APP || {};

const apiKey = process.env.API_KEY;
let index: number;
let page: number;
let placeText: HTMLSpanElement;
let wordText: HTMLSpanElement;
let currentLocationButton: HTMLElement;
let currentPlace = "東京都";
let currentWord = "";
let searchResultsUl: HTMLElement;
let addressInput: HTMLInputElement;
let inputDeleteIcon: HTMLElement;
let square: HTMLDivElement;

let loadingText: HTMLParagraphElement;
let mainText: HTMLParagraphElement;
const loadingTransition: number = 700;

const bgColorArray: string[] = [
  "#FFDEFA",
  "#BEEBE9",
  "#FFB6B9",
  "#D8D2CB",
  "#F0134D",
  "#40BFC1",
  "#FB7813",
  "#B6EB7A",
  "#17706E",
  "#0077C0",
];

let latitude: number;
let longitude: number;

type objtype = {
  cityName: string;
  word: string;
};
let recordObject: objtype[] = new Array();
// let hadPushed

// 一旦のタグのワード数 手動
// その他tagの候補: #vs, #n-adv, #common
const tag: string = "adjective";
const wordNum: number = 18392;
const pageMax: number = wordNum / 20;

index = dataProcessor.getIndex(currentPlace);
// console.log("インデックス: " + index);
page = dataProcessor.getPage(pageMax);
// console.log("ページ数: " + page);

const initApp = () => {
  window.APP = APP;
  APP.Info = new Info();

  placeText = document.getElementById("place-text");
  wordText = document.getElementById("word-text");
  currentLocationButton = document.getElementById("current-location-button");
  searchResultsUl = document.getElementById("search-results-ul");
  loadingText = document.getElementById("loading-text") as HTMLParagraphElement;
  mainText = document.getElementById("main-text") as HTMLParagraphElement;
  addressInput = document.getElementById("address-input") as HTMLInputElement;
  inputDeleteIcon = document.getElementById("input-delete");
  square = document.getElementById("square") as HTMLDivElement;

  const randomIndex = Math.floor(Math.random() * bgColorArray.length);
  changeBgColor(bgColorArray[randomIndex]);

  getWord();

  addressInput.addEventListener("input", (event: any) => {
    if (!event.target.value) {
      clearSearchResults();
      hideInputDeleteIcon();
      return;
    }
    showInputDeleteIcon();
    searchLocationName(event.target.value)
      .then((data: any) => {
        // console.log(data);
        displaySearchResults(data.Feature);
      })
      .catch((error) => {
        // YahooジオコーダAPI エラー
        console.log(error);
      });
  });

  inputDeleteIcon.addEventListener("click", () => {
    updateInputValue("");
  });

  currentLocationButton.addEventListener("click", () => {
    showLoadingText();
    getCurrentLocationName()
      .then((locationName: string) => {
        changeCity(locationName);
        getWord();
      })
      .catch((error) => {
        console.error("エラー:", error.message);
        alert("位置情報を取得できませんでした");
        hideLoadingText();
      });
  });
};

const changeBgColor = (color: string) => {
  square.style.backgroundColor = color;
};

const hideInputDeleteIcon = () => {
  inputDeleteIcon.classList.add("is-hidden");
};

const showInputDeleteIcon = () => {
  inputDeleteIcon.classList.remove("is-hidden");
};

const showLoadingText = () => {
  mainText.classList.add("is-hidden");
  // setTimeout(() => {
  loadingText.classList.remove("is-hidden");
  // }, loadingTransition);
};

const hideLoadingText = () => {
  loadingText.classList.add("is-hidden");
  // setTimeout(() => {
  mainText.classList.remove("is-hidden");
  // }, loadingTransition);
};

const changeCity = (locationName: string) => {
  currentPlace = locationName;
  index = dataProcessor.getIndex(currentPlace);
  // console.log("インデックス: " + index);
  page = dataProcessor.getPage(pageMax);
  // console.log("ページ数: " + page);
};

const updateText = () => {
  wordText.innerText = currentWord;
  placeText.innerText = currentPlace;
};

const addRecord = () => {
  recordObject.push({ cityName: currentPlace, word: currentWord });
  // console.log(recordObject);
};

const findCityRecord = (cityNameToCheck: string) => {
  return recordObject.find((obj) => obj.cityName === cityNameToCheck);
};

const getWord = () => {
  jisho
    .searchForTag(tag, page)
    .then((result) => {
      const finalIndex = index % result.data.length;
      // console.log("finalIndex: " + finalIndex);
      currentWord = result.data[finalIndex].slug;
      // console.log("currentWord: " + currentWord);
      hideLoadingText();
      updateText();
      addRecord();
    })
    .catch((error) => {
      alert("接続エラーが発生しました。もう一度お試しください。");
      console.error(error.message);
    });
};

// 現在地の名前を取得する関数
const getCurrentLocationName = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      // Geolocation APIをサポートしている場合
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 現在の位置情報を取得
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;

          const reverseGeocodingApiUrl =
            "https://map.yahooapis.jp/geoapi/V1/reverseGeoCoder";
          const requestUrl = `${reverseGeocodingApiUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&output=json`;

          // APIリクエストの送信
          fetch(requestUrl)
            .then((response) => response.json())
            .then((data) => {
              // console.log(data);
              if (data.Feature && data.Feature[0] && data.Feature[0].Property) {
                // console.log(data.Feature[0].Property);
                const locationName =
                  data.Feature[0].Property.AddressElement[0].Name +
                  data.Feature[0].Property.AddressElement[1].Name;
                resolve(locationName);
              } else {
                console.error("位置名が取得できませんでした。");
                reject(false);
              }
            })
            .catch((error) => {
              console.error("エラー:", error.message);
              reject(error);
            });
        },
        (error) => {
          reject(new Error("位置情報を取得できませんでした。"));
        }
      );
    } else {
      // Geolocation API unsupported
      reject(new Error("位置情報を取得できませんでした。"));
    }
  });
};

const searchLocationName = (address: string) => {
  return new Promise((resolve, reject) => {
    const geocodingApiUrl = "https://map.yahooapis.jp/geocode/V1/geoCoder";
    const requestUrl = `${geocodingApiUrl}?appid=${apiKey}&query=${encodeURIComponent(
      address
    )}&output=json`;

    fetch(requestUrl)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const clearSearchResults = () => {
  searchResultsUl.innerHTML = "";
};

const updateInputValue = (text: string) => {
  addressInput.value = text;
};

const displaySearchResults = (candidates) => {
  clearSearchResults();
  if (candidates && candidates.length > 0) {
    let newcandidates: any[];
    if (candidates.length >= 3) newcandidates = candidates.slice(0, 3);
    newcandidates.forEach((item: any) => {
      const li = document.createElement("li");
      li.textContent = item.Name;
      searchResultsUl.appendChild(li);
      li.addEventListener("click", () => {
        showLoadingText();
        updateInputValue(item.Name);
        clearSearchResults();
        const recordInfo = findCityRecord(item.Name);
        // console.log(recordInfo);
        if (recordInfo) {
          currentPlace = recordInfo.cityName;
          currentWord = recordInfo.word;
          hideLoadingText();
          updateText();
        } else {
          changeCity(item.Name);
          getWord();
        }
      });
    });
  } else {
    // searchResults.textContent = "No results found";
  }
};

window.addEventListener("load", initApp);

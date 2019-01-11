const anaManifest = {
  anaSearchURL: "https://aswbe-i.ana.co.jp/international_asw/pages/award/search/roundtrip/award_search_roundtrip_input.xhtml?rand=20190101161446&CONNECTION_KIND=LAX&LANG=en",
  anaLoginIndexURL: "https://www.ana.co.jp/en/us",
  anaLoginFwdURL: "https://www.ana.co.jp/asw/global/include/amcloginconfirm_e.jsp?type=us/en",
  anaUserName: "4395947884",
  anaPassword: "7fb4CTws9fGVCtU"
};

var HttpClient = function() {
  this.get = function(aUrl, aCallback, withCredentials) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.withCredentials = withCredentials;
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }

    this.post = function(aUrl, aData, aCallback, withCredentials) {
      var anHttpRequest = new XMLHttpRequest();
      anHttpRequest.withCredentials = withCredentials;
      anHttpRequest.onreadystatechange = function() {
          if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
              aCallback(anHttpRequest);
      };

      anHttpRequest.open("POST", aUrl);
      anHttpRequest.send(aData);
    }
}
var client = new HttpClient();
const parser = new DOMParser();

chrome.runtime.onInstalled.addListener(
  () => {
    chrome.storage.sync.set(anaManifest, () => console.log(anaManifest));
    client.get(anaManifest.anaLoginIndexURL, (response) => {
      const loginDoc = parser.parseFromString(response, "text/html");
      console.log(loginDoc);
      anaManifest.anaSearchURL = loginDoc.querySelector("div#module-ticket");
      console.log(anaManifest.anaSearchURL);

      if (isLoggedIn) {
        console.log("Valid Cookie Exists.");
        searchMileageTicket(response);
      } else {
        console.log("Need to re-login.");
        loginDoc.getElementById("accountNumber").value = anaManifest.anaUserName;
        loginDoc.getElementById("password").value = anaManifest.anaPassword;

        const formData = new FormData(loginDoc.querySelector("#j_idt390"));
        console.log(formData.action);
        client.post(formData.action, formData, function(request) {
          // Gain access to the mileage ticket search engine
          console.log("Verified Re-Log-In.");
          clinet.get(anaManifest.anaSearchURL, searchMileageTicket, true);
        }, false);
      }
    }, false);
    // client.get(anaManifest.anaLoginIndexURL, function(request) {
    //   const loginDoc = parser.parseFromString(request.responseText, "text/html");
    //   const isLoggedIn = !loginDoc.getElementById("login-custno");
    //
    //   // Get the browser cookie if not logged in, otherwise, logg in with credentials
    //   if (isLoggedIn) {
    //     console.log("Valid Cookie Exists.");
    //     client.get(anaManifest.anaSearchURL, searchMileageTicket, true);
    //   } else {
    //     console.log("Cookie Not Found, Trying to re-Log-In.");
    //     // Modify the login form and submit the request
    //     loginDoc.getElementById("login-custno").value = anaManifest.anaUserName;
    //     loginDoc.getElementById("login-password").value = anaManifest.anaPassword;
    //     const formData = new FormData(loginDoc.querySelector("div.js-toggleInner div form"));
    //     client.post(anaManifest.anaLoginFwdURL, formData, function(request) {
    //       // Gain access to the mileage ticket search engine
    //       console.log("Verified Re-Log-In.");
    //       clinet.get(anaManifest.anaSearchURL, searchMileageTicket, true);
    //     }, false);
    //   }
    // }, false);
  }
);

const searchMileageTicket = (request) => {
  const searchDoc = parser.parseFromString(request.responseText, "text/html");

  // Departure Airport City
  searchDoc.querySelector("#departureAirportCode").value = "Seattle";
  // Arrival Airport City
  searchDoc.querySelector("#arrivalAirportCode:field_pctext").value = "Hongkong";
  // Departure Date in Digits
  searchDoc.querySelector("#awardDepartureDate:field").value = "20190301";
  // Arrival Date in Digits
  searchDoc.querySelector("#awardReturnDate:field").value = "20190304";
}

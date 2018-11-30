const urlShortnerForm = document.getElementById("urlShortenerForm");
const urlShortenerInput = urlShortnerForm.querySelector("#urlInput");
const urlSubmitButton = urlShortnerForm.querySelector("#urlSubmit");
const infoBox = document.querySelector(".info-box");

urlShortnerForm.addEventListener("submit", async e => {
  //prevent default behaviour on submit
  e.preventDefault();
  //set the loading true
  urlSubmitButton.disabled = true;
  //take the value out of the input
  const inputValue = urlShortenerInput.value;
  //Test the value of the input to be a valid url format
  const urlTestRegExp = new RegExp(
    /^((http|https):\/\/)?(www\.)?[a-zA-Z0-9\-\.]+\.[a-z]+(\/[a-zA-Z0-9\-_\.]+)*\/?$/
  );
  //If the input does not have a value that does match the criterias, show error
  if (!inputValue || !urlTestRegExp.test(inputValue)) {
    fillInfoBox("",  "Not a valid url" );
    return;
  }

  //Post to the API
  const Url = "/api/shorturl/new";
  const requestBody = JSON.stringify({ url: inputValue });
  const otherParams = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: requestBody
  };
  try {
    const data = await fetch(Url, otherParams);
    const dataJsoned = await data.json();
    
    if(data.status != 200 && data.status != 201){
      throw new Error(dataJsoned.message)
    }
    fillInfoBox(dataJsoned);
  } catch (err) {
    fillInfoBox("", err.message);
  }
});

function fillInfoBox(data, error = false) {
  urlSubmitButton.disabled = false;
  infoBox.classList = "info-box";
  let infoBoxData = "";
  //change classes for error or succes
  if (error) {
    infoBox.classList.add("error");
    infoBoxData = `<h2>An error occured!</h2><p>${error}</p>`;
  } else {
    infoBox.classList.add("succes");
    infoBoxData = `<h2>Short url created!</h2>
  <p>Short url data :<br> {original_url : ${data.original_url} , short_url : ${
      data.short_url
    }}</p>
  <p>Visit <a href=${window.location.href}api/shorturl/${data.short_url}>${
      window.location.href
    }api/shorturl/${data.short_url}.</a></p>`;
  }
  infoBox.innerHTML = infoBoxData;
}

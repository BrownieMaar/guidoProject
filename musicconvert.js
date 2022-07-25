const barCharacters = [":", ";", ","];

function arrayToHtmlTable(myArray) {
  let myTable = "<table><tr>";
  for (let cell of myArray) {
    myTable += `<td>${cell}</td>`;
  }
  myTable += "</tr></table>";
  return myTable;
}

function writeOutInPreDiv(outStr, id) {
  console.log(outStr);
  let outElement = document.createElement("pre");
  outElement.setAttribute("id", id);
  outElement.innerHTML = outStr;
  document.body.appendChild(outElement);
}

function getGuidoCharWidth(charStr, fontSize) {
  let virtualElement = document.getElementById("testCanv");
  let contextOfVirtualElement = virtualElement.getContext("2d");
  let guidoFont = new FontFace("Guido HU", "url(./guidohu_.ttf)");
  contextOfVirtualElement.font = fontSize + " " + guidoFont.family;
  contextOfVirtualElement.clearRect(0,0,500,400)
  contextOfVirtualElement.fillText(charStr, 0, 50);
  let widthOfChar = contextOfVirtualElement.measureText(charStr).width;
  //virtualElement.remove();
  return widthOfChar;
}

function getCharWidth(charStr, fontSize, font) {
  let virtualElement = document.createElement("canvas");
  let contextOfVirtualElement = virtualElement.getContext("2d");
  contextOfVirtualElement.font = fontSize + " " + font;
  let widthOfChar = contextOfVirtualElement.measureText(charStr).width;
  virtualElement.remove();
  return widthOfChar;
}

function combineMusicElements(music, whiteSpace) {
  const combinedMusic = [];
  for (let i = 0; i < music.length; i++) {
    combinedMusic.push(music[i]);
    combinedMusic.push(whiteSpace[i]);
  }
  return combinedMusic.join("");
}

function computeTextElementWidths(musicObj) {
  const computedTextElementWidth = {
    textWidth: [0],
    whiteSpaceWidth: [getGuidoCharWidth(musicObj.music[0], "60px")],
  };

  for (let i = 1; i < musicObj.musicText.length; i++) {
    let musicLength = getGuidoCharWidth(musicObj.music[i], "60px");
    let musicWhiteSpaceLength = getGuidoCharWidth(musicObj.musicWhiteSpace[i], "60px");
    let musicTextLength = getCharWidth(musicObj.musicText[i], "30px", "Book Antiqua");

    if (musicTextLength > musicLength) {
      computedTextElementWidth.whiteSpaceWidth[i - 1] -=
        (musicTextLength - musicLength) / 2;
      computedTextElementWidth.textWidth[i] = musicTextLength;
      computedTextElementWidth.whiteSpaceWidth[i] = musicWhiteSpaceLength;
      computedTextElementWidth.whiteSpaceWidth[i] -=
        (musicTextLength - musicLength) / 2;
    }
    if (musicTextLength <= musicLength) {
      computedTextElementWidth.textWidth[i] = musicTextLength;
      computedTextElementWidth.whiteSpaceWidth[i] = musicWhiteSpaceLength;
      computedTextElementWidth.whiteSpaceWidth[i] +=
        musicLength - musicTextLength;
    }
  }

  return computedTextElementWidth;
}

function combineMusicTextElements(musicObj) {
  const computedTextElementWidth = computeTextElementWidths(musicObj);
  let formattedTextString = "";



  for (let i = 0; i<musicObj.musicText.length; i++) {
    if (computedTextElementWidth.textWidth[i] !== 0) {
      formattedTextString += `<span style="width: ${Math.round(computedTextElementWidth.textWidth[i])}px">${musicObj.musicText[i]}</span>`
    }

    formattedTextString += `<span style="width: ${Math.round(computedTextElementWidth.whiteSpaceWidth[i])}px">${(musicObj.isSpaceAfter[i] || [0,musicObj.musicText.length - 1].includes(i)) ? "" : "-"}</span>`

  }


  return formattedTextString;
}

function sliceUpInput(codeMusic) {
  const music = [];
  const musicWhiteSpace = [];
  const musicText = [];
  const isSpaceAfter = [];
  let blockBuffer = "";
  let isMusicBeingInspected = false;
  isEndingWithOpenedMusicBlock = false

  for (let char of codeMusic) {
    if (char === "(") isEndingWithOpenedMusicBlock = true;
    if (char === ")") isEndingWithOpenedMusicBlock = false;
  }

  if (isEndingWithOpenedMusicBlock) codeMusic += ")"

  if (codeMusic[codeMusic.length - 1] !== (")")) codeMusic += "()"

  for (let x of codeMusic) {
    if (x === "(") {
      musicText.push(blockBuffer);
      blockBuffer = "";
      isMusicBeingInspected = true;
      continue;
    }

    if (x === ")") {
      music.push(blockBuffer);
      blockBuffer = "";
      isSpaceAfter.push(false);
      musicWhiteSpace.push("---");
      isMusicBeingInspected = false;
      continue;
    }

    if (x === " ") {
      isSpaceAfter.pop();
      isSpaceAfter.push(true);
      continue;
    }

    if (barCharacters.includes(x) && isMusicBeingInspected) {
      musicWhiteSpace[musicWhiteSpace.length - 1] = `-${x}--`;
      continue;
    }

    blockBuffer += x;
  }

  //isSpaceAfter.pop();
  musicWhiteSpace[0] = "";
  musicWhiteSpace[musicWhiteSpace.length - 1] = "";

  return {
    music: music,
    musicText: musicText.map((string) => string.replace(" ", "")),
    isSpaceAfter: isSpaceAfter,
    musicWhiteSpace: musicWhiteSpace,
  };
}

function workspace() {
  const slicedMusic = sliceUpInput(document.getElementById("musIn").value);
  const music = slicedMusic.music;
  const musicText = slicedMusic.musicText;
  const isSpaceAfter = slicedMusic.isSpaceAfter;
  const musicWhiteSpace = slicedMusic.musicWhiteSpace;

  document.getElementById("musOut").innerHTML = combineMusicElements(
    music,
    musicWhiteSpace
  );
  document.getElementById("musicTextOut").innerHTML = combineMusicTextElements(slicedMusic);
}

workspace();

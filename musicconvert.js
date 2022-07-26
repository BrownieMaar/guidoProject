const barCharacters = ["'", '"', "+", "!", "%", "/", "=", ":", ";", ",", ".", "(", ")", "Ö", "Ü", "Ó"];

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
  let virtualElement = document.createElement("canvas");
  let contextOfVirtualElement = virtualElement.getContext("2d");
  contextOfVirtualElement.font = `${fontSize} ${"GuidoHU"}`;
  let widthOfChar = contextOfVirtualElement.measureText(charStr).width;
  virtualElement.remove();
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
  return combinedMusic.join("").replace("<", "&lt");
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



  for (let i = 0; i < musicObj.musicText.length; i++) {
    if (computedTextElementWidth.textWidth[i] !== 0) {
      formattedTextString += `<span style="width: ${Math.round(computedTextElementWidth.textWidth[i])}px">${musicObj.musicText[i]}</span>`
    }

    formattedTextString += `<span style="width: ${Math.round(computedTextElementWidth.whiteSpaceWidth[i])}px">${(musicObj.isSpaceAfter[i] || [0, musicObj.musicText.length - 1].includes(i)) ? "" : "-"}</span>`

  }


  return formattedTextString;
}

function musicCodeToMusicObject(codeMusic) {
  const music = [];
  const musicWhiteSpace = [];
  const musicText = [];
  const isSpaceAfter = [];
  let blockBuffer = "";
  let isMusicBeingInspected = false;
  let starterChar;
  let closerChar;

  for (let char of codeMusic) {
    if (char === "(" && !isMusicBeingInspected) {
      starterChar = "("
      closerChar = ")"
      isMusicBeingInspected = true;
    } 
    
    if (char === "{" && !isMusicBeingInspected) {
      starterChar = "{"
      closerChar = "}"
      isMusicBeingInspected = true;
    }
    if (char === closerChar) {
      isMusicBeingInspected = false;
    }
  }
  if (isMusicBeingInspected) {
    codeMusic += closerChar;
  }

  if (!isMusicBeingInspected && ![")", "}"].includes(codeMusic[codeMusic.length - 1])) {
    codeMusic += "()";
  }


  //re-initializing variables
  isMusicBeingInspected = false;


  for (let i = 0; i < codeMusic.length; i++) {

    if (codeMusic[i] === "(" && !isMusicBeingInspected) {
      starterChar = "("
      closerChar = ")"
    } 

    if (codeMusic[i] === "{" && !isMusicBeingInspected) {
      starterChar = "{"
      closerChar = "}"
    }

    if (codeMusic[i] === starterChar) {
      musicText.push(blockBuffer);
      blockBuffer = "";
      isMusicBeingInspected = true;
      continue;
    }

    if (codeMusic[i] === closerChar) {
      music.push(blockBuffer);
      blockBuffer = "";
      isSpaceAfter.push(false);
      if (musicWhiteSpace.length !== music.length) {
        musicWhiteSpace.push("---");
      }
      isMusicBeingInspected = false;
      continue;
    }

    if (codeMusic[i] === " ") {
      isSpaceAfter.pop();
      isSpaceAfter.push(true);
      continue;
    }

    if (barCharacters.includes(codeMusic[i]) && isMusicBeingInspected) {
      if (codeMusic[i - 1] === starterChar) musicWhiteSpace[musicWhiteSpace.length - 1] = `-${codeMusic[i]}--`;
      else if (codeMusic[i + 1] === closerChar) musicWhiteSpace[musicWhiteSpace.length] = `-${codeMusic[i]}--`;
      continue;
    }

    blockBuffer += codeMusic[i];
  }

  if (![")", "}"].includes(codeMusic[codeMusic.length-1]) && isMusicBeingInspected) music.push(blockBuffer);
  if (![")", "}"].includes(codeMusic[codeMusic.length-1]) && !isMusicBeingInspected) musicText.push(blockBuffer);
  
  music[0] += "-"
  musicWhiteSpace[0] = "";
  if (barCharacters.includes(musicWhiteSpace[musicWhiteSpace.length - 1][1])) {
    musicWhiteSpace[musicWhiteSpace.length - 1] = musicWhiteSpace[musicWhiteSpace.length - 1].slice(0,2)
  } else {
    musicWhiteSpace[musicWhiteSpace.length - 1] = ""
  }

  return {
    music: music,
    musicText: musicText.map((string) => string.replace(" ", "")),
    isSpaceAfter: isSpaceAfter,
    musicWhiteSpace: musicWhiteSpace,
  };
}

function workspace() {
  const slicedMusic = musicCodeToMusicObject(document.getElementById("musIn").value);
  const music = slicedMusic.music;
  const musicText = slicedMusic.musicText;
  const isSpaceAfter = slicedMusic.isSpaceAfter;
  const musicWhiteSpace = slicedMusic.musicWhiteSpace;
  console.table(slicedMusic);

  document.getElementById("musOut").innerHTML = combineMusicElements(
    music,
    musicWhiteSpace
  );
  document.getElementById("musicTextOut").innerHTML = combineMusicTextElements(slicedMusic);
}
function callThis() {
  workspace;
}


window.onload = (event) => workspace();
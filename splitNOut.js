
function sliceUpInput() {
    let origCode = document.getElementById("musIn").value;
    let music = "";
    let musicText = "";
    let isMusic;
    
    if (origCode[0] !== "(") {
        return `A kódnak nyitózárójellel kell kezdődnie!`
    }
    
    for (let x of origCode) {
        if (x === "(") {
            isMusic = true;
            continue;
        }

        if (x === ")") {
            isMusic = false;
            continue;
        }

        if (isMusic) {
            music += x;
        } else {
            musicText += x;
        }

    }

    document.getElementById("musOut").innerHTML = music;
    document.getElementById("place").innerHTML = musicText;
}

sliceUpInput();
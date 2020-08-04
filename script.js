// let painting  = Painterro({
//   id: "paint",
//   colorScheme: {
//     main: '#39b7c2', // make panels light-yellow
//     control: '#153570', // change controls color
//     controlContent: "#FFFFFF",
//     backgroundColor: "#FFFFFF"
//   },
//   saveHandler: function (image, done) {
//     // of course, instead of raw XHR you can use fetch, jQuery, etc
    
//     console.log(image);
//     localStorage.image = image.asDataURL();
//     done(false);

//   }
// });


// https://github.com/mdn/js-examples/blob/5f27ca4bccfc1c47ebab8ba0d57eb9ec4724916e/promises-test/index.html#L23
function imgLoad(url) {
  // Create new promise with the Promise() constructor;
  // This has as its argument a function
  // with two parameters, resolve and reject
  return new Promise(function (resolve, reject) {
    // Standard XHR to load an image
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = url.endsWith(".svg")? "text":'blob';
    // When the request loads, check whether it was successful
    request.onload = function () {
      if (request.status === 200) {
        if (url.endsWith(".svg")) {   
          // If successful, resolve the promise by passing back the request response
          resolve(request.response);
        } else {
          var fr = new FileReader();
          fr.onload = () => resolve(fr.result);
          fr.readAsDataURL(request.response)
        }

      } else {
        // If it fails, reject the promise with a error message
        reject(Error('Image didn\'t load successfully; error code:' + request.statusText));
      }
    };
    request.onerror = function () {
      // Also deal with the case when the entire request fails to begin with
      // This is probably a network error, so reject the promise with an appropriate message
      reject(Error('There was a network error.'));
    };
    // Send the request
    request.send();
  });
}

// painting.show(localStorage.image);


$(".blankline").each((i, el) => {
  const id = "input" + i;
  const $line = $(el);
  let $input = $("<input>")
    .val(localStorage[id])
    .change(() => {
      localStorage[id] = $input.val();
    })
    .width($line.innerWidth() - 12)
    //.offset($line.offset())
    .addClass("blankInput");

//   if($line.hasClass("svg")){
//     <foreignObject x="20" y="90" width="150" height="200">
// <p xmlns="http://www.w3.org/1999/xhtml">Text goes here</p>
// </foreignObject>
//   }
    $input.prependTo($line);

});

let quills = [];

$(".notes").each((i, el)=>{
  el.id = "note" + i;

  var quill = new Quill("#" + el.id, {
    modules: {
      syntax: true,
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
  
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
  
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],
  
        ['clean']                                         // remove formatting button
      ]
    },
    placeholder: 'Take notes here...',
    theme: 'snow'
  });

  try{
    quill.setContents(JSON.parse(localStorage[quill.container.id]));
  }
  catch{
  }
  quills.push(quill);
});



// Save periodically
setInterval(save, 5*1000);

function save() {
    //console.log('Saving changes', change);
    
    // painting.save();
    for(let quill of quills){
      localStorage[quill.container.id] = JSON.stringify(quill.getContents());
    }
    /* 
    Send partial changes
    $.post('/your-endpoint', { 
      partial: JSON.stringify(change) 
    });
    
    Send entire document
    $.post('/your-endpoint', { 
      doc: JSON.stringify(quill.getContents())
    });
    */
}

function removeElementsByClass(className, from) {
  var elements = from.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

function removeElementsByTag(tagName, from) {
  var elements = from.getElementsByTagName(tagName);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}


async function getCleanMarkup() {
  document.getElementById("printpage").disabled = true;
  // https://stackoverflow.com/a/10585079
  var markup = document.createElement('html');
  markup.innerHTML = document.documentElement.innerHTML;

  const imagePromises = []

  //we now have a copy of the DOM

    // for (const element of markup.getElementsByTagName("script")) {
    //   element.parentNode.removeChild(element);
    // }

  removeElementsByTag("script", markup)

  //remove quill toolbars
  // for (const element of markup.getElementsByClassName("ql-toolbar")) {
  //   element.innerHTML = ''
  //   element.parentNode.removeChild(element);
  // }
  removeElementsByClass("ql-toolbar", markup)
  // replace all quill fields with their text
  for (const note of markup.getElementsByClassName("notes")) {
    //clear all content and add quill html in one step
    //note.id is in format note##
    note.innerHTML = quills[note.id.substr(4, 2)].root.innerHTML;
  }

  //replace all images with data_urls
  for (const element of markup.getElementsByTagName("img")) {
    // console.log(element.src)

    if (element.src.endsWith(".svg")) {
      imagePromises.push(imgLoad(element.src).then( (response)=> {

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        v = canvg.Canvg.fromString(ctx, response);

        // Start SVG rendering with animations and mouse handling.
        v.start();
        // alert(allText);
        element.src = canvas.toDataURL("image/png");
      }))
    } else {
      //image is a png
      imagePromises.push(imgLoad(element.src).then((image) => {

         element.src=image
        })
        .catch((error) => { console.error(error) })
      )
      }
  }

  Promise.all(imagePromises).then(() => {


    // console.log(markup.innerHTML)
    var val = htmlToPdfmake(markup.innerHTML);
    var dd = { content: val };
    pdfMake.createPdf(dd).download();
    document.getElementById("printpage").disabled = false;

  })

}
// Check for unsaved data
window.onbeforeunload = save;
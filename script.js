let painting  = Painterro({
  id: "paint",
  colorScheme: {
    main: '#39b7c2', // make panels light-yellow
    control: '#153570', // change controls color
    controlContent: "#FFFFFF",
    backgroundColor: "#FFFFFF"
  },
  saveHandler: function (image, done) {
    // of course, instead of raw XHR you can use fetch, jQuery, etc
    
    console.log(image);
    localStorage.image = image.asDataURL();
    done(false);

  }
});


painting.show(localStorage.image);



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
    quill.setContents(JSON.parse(localStorage[quill.id]));
  }
  catch{
  }
});



// Save periodically
setInterval(save, 5*1000);

function save() {
    //console.log('Saving changes', change);
    
    painting.save();
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

// Check for unsaved data
window.onbeforeunload = save;
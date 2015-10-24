// Instantiate an empty object.
var Instagram = {};

// Small object for holding important configuration data.
Instagram.Config = {
  clientID: '80e2179188064513abc38425a6732f99',
  apiHost: 'https://api.instagram.com'
};


// ************************
// ** Main Application Code
// ************************
(function(){
  var photoTemplate, resource;

  function init(){
    bindEventHandlers();
    photoTemplate = _.template($('#photo-template').html());
  }

  

  function userReturn(id) {
    var theUser;
    var thePhoto;
    var config = Instagram.Config;
    userUrl = config.apiHost + "/v1/users/" + id + "/?client_id=80e2179188064513abc38425a6732f99";
    $.getJSON(userUrl, function(user) {
      user = {
          username: user.data.username,
          full_name: user.data.full_name,
          profile_picture: user.data.profile_picture,
          counts: {
            media: user.data.counts.media,
            follows: user.data.counts.follows,
            followed_by: user.data.counts.followed_by,
            id: user.data.id
          }
        };
      theUser = user;
      console.log(theUser);
      return theUser;
    });
  }

  function photoReturn(photo, userRet) {
      newPhoto = {
      count: photo.likes.count,
      avatar: photo.user.profile_picture,
      photo: photo.images.low_resolution.url,
      url: photo.link,
      likesCount: photo.likes.count,
      user: userRet,
      caption: photo.caption.text
    };
    return newPhoto;
  }

  function toTemplate(photo){
    var userRet = userReturn(photo.user.id);
    var newPhoto = photoReturn(photo, userRet);
    console.log(newPhoto);
    return photoTemplate(newPhoto);
  }


  function toScreen(photos){
    var photos_html = '';

    $('.paginate a').attr('data-max-tag-id', photos.pagination.next_max_id)
                    .fadeIn();

    $.each(photos.data, function(index, photo){
      photos_html += toTemplate(photo);
    });

    $('div#photos-wrap').append(photos_html);
  }



  function generateResource(tag){
    var config = Instagram.Config, url;

    if(typeof tag === 'undefined'){
      throw new Error("Resource requires a tag. Try searching for Capital One.");
    } else {
      // Make sure tag is a string, trim any trailing/leading whitespace and take only the first 
      // word, if there are multiple.
      tag = String(tag).trim().split(" ")[0];
    }
    url = config.apiHost + "/v1/tags/" + tag + "/media/recent?callback=?&client_id=" + config.clientID;

    return function(max_id){
      var next_page;
      if(typeof max_id === 'string' && max_id.trim() !== '') {
        next_page = url + "&max_id=" + max_id;
      }
      return next_page || url;
    };
  }

  function paginate(max_id){    
    $.getJSON(generateUrl(tag), toScreen);
  }

  function search(tag){
    resource = generateResource(tag);
    $('.paginate a').hide();
    $('#photos-wrap *').remove();
    fetchPhotos();
  }

  function fetchPhotos(max_id){
    $.getJSON(resource(max_id), toScreen);
  }

  function bindEventHandlers(){
    $('body').on('click', '.paginate a.btn', function(){
      var tagID = $(this).attr('data-max-tag-id');
      fetchPhotos(tagID);
      return false;
    });

    // Bind an event handler to the `submit` event on the form
    $('form').on('submit', function(e){

      // Stop the form from fulfilling its destinty.
      e.preventDefault();

      // Extract the value of the search input text field.
      var tag = $('input.search-tag').val().trim();

      // Invoke `search`, passing `tag` (unless tag is an empty string).
      if(tag) {
        search(tag);
      };

    });

  }

  function showPhoto(p){
    $(p).fadeIn();
  }

  // Public API
  Instagram.App = {
    search: search,
    showPhoto: showPhoto,
    init: init
  };
}());

$(function(){
  Instagram.App.init();
  
  Instagram.App.search('CapitalOne');  
});


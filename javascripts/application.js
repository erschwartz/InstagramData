// Instantiate an empty object.
/*
                 // Variable allPosts[] contains all of the posts fetched from Instagram based on the searched hashtag (~20 on first query).
                 // It has ~20 more posts added to it everytime "Load More" is pressed, since more posts are fetched.
                 // When a different "Sort By" option is chosen, the variable will reset.

                 // You can start from here in implementing the algorithms and D3 visualizations.

                 // These are my (by no means complete) notes on making an algorithm to asses the effectivity of a hashtag

                      // USER
                      // Followers ++
                      // Following -
                      // Number of Posts +/-
                      //
                      // POST
                      // Likes ++
                      // Comments +/-
                      //  Depends on Sentiment (speaking of which, here are two links that discuss API's for it)
                      //    http://blog.mashape.com/list-of-20-sentiment-analysis-apis/
                      //    https://www.quora.com/Where-can-I-find-an-online-API-for-sentiment-analysis
                      //
                      // IF “user_has_liked” === TRUE
                      //  Likes---
                      //
                      //
                      // Followers - (Following * 0.1) + [Assess their post reach history] = Reputation/Reach of User
                      //  Post Reach history: Potnetially Look into the performance of their posts in the past, find a way to use that information to better judge the user's significance
                      //
                      // Non OP Likes + Positive Sentiments - Negative Sentiments + (Neutral * 0.1 {shows engagement in the post}) = Effect of the post on the company
                      //
                      // Rep/Reach of user + Post’s take on company = influence of the hashtag in the specific post (+/-)
                      //
                      // Influence of all posts (Pos - Neg) / # of posts = Effectiveness of the hashtag

                  // Don't forget to wake me up!!!*/
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

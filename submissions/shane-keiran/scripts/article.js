// TODO:NE Wrap the entire contents of this file in an IIFE.
// Pass in to the IIFE a module, upon which objects can be attached for later access.

(function(module) {

  function Article (opts) {
    for (key in opts) {
      this[key] = opts[key];
    }
  }

  Article.all = [];

  Article.prototype.toHtml = function(scriptTemplateId) {
    var template = Handlebars.compile(scriptTemplateId.html());

    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
    this.body = marked(this.body);

    return template(this);
  };

  Article.loadAll = function(dataWePassIn) {
    dataWePassIn.sort(function(a,b) {
      return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
    });

    /* DONE: the original forEach code below has been refactored
       using `.map()` -  since what we are trying to accomplish is the
       transformation of one colleciton into another.

       dataWePassIn.forEach(function(ele) {
        Article.all.push(new Article(ele));
       }) */
    Article.all = dataWePassIn.map(function(ele) {
      return new Article(ele);
    });
  };

  // This function will retrieve the data from either a local or remote source,
  // and process it, then hand off control to the View.

  /* TODO:NE Refactoring the Article.fetchAll method, it now accepts a parameter
      called 'next' ('next' is just a placeholder, but when referenced at
      the time fetchAll is called it will be a 'view' function) that will
      execute once the loading of articles is done. We do this because
      we might want to call other view functions, and not just initIndexPage();
      Now instead of calling articleView.initIndexPage(), we can call
      whatever we pass in! */
  Article.fetchAll = function(next) {
    console.log('fetching all');
    if (localStorage.hackerIpsum) {
      console.log('local storage hackerIpsum exists');
      $.ajax({
        type: 'HEAD',
        url: '/data/hackerIpsum.json',
        success: function(data, message, xhr) {
          var eTag = xhr.getResponseHeader('eTag');
          console.log(eTag);
          if (!localStorage.eTag || eTag !== localStorage.eTag) {
            console.log(localStorage.eTag);
            localStorage.eTag = eTag;
            Article.getAll(next); //TODO:NE pass 'next' into getAll();
          } else {
            console.log('etag is the same');
            Article.loadAll(JSON.parse(localStorage.hackerIpsum));
            // TODO:NE Replace the following line with 'next' and call next instead.
            next();
            // articleView.initIndexPage();
          }
        }
      });
    } else {
      console.log('no local storage');
      Article.getAll(next); // TODO:NE pass 'next' into getAll();
    }
  };

  Article.getAll = function(next) {
    console.log('gettingJSON');
    $.getJSON('/data/hackerIpsum.json', function(responseData) {
      Article.loadAll(responseData);
      localStorage.hackerIpsum = JSON.stringify(responseData);
      // TODO:NE call next!
      next();
    });
  };

  /* TODO:NE? Chain together a `map` and a `reduce` call to get a rough count of
      all words in all articles. */
  Article.numWordsAll = function() {
    return Article.all.map(function(article) {
        //DONE: Grab the word count from each article body.
      return article.body.match(/\b\w+/g).length;
    })
    .reduce(function(a, b) {
      // return (TODO:NE? Sum up all the values!)
      return a + b;
    });
  };

  /* TODO:NE Chain together a `map` and a `reduce` call to
            produce an array of *unique* author names. */
  Article.allAuthors = function() {
    //return       TODO: map our collection
      //return    TODO: return just the author names

    return Article.all.map(function(article){
      return article.author;
    })

    /* TODO:NE For our `reduce` that we'll chain here -- since we are trying to
        return an array, we'll need to specify an accumulator type...
        What data type should this accumulator be and where is it placed?
        (racecar)
    */

        .reduce(function(acc, cur, idx, array){
          if(array.indexOf(cur) === idx){
            acc.push(cur);
          }
          return acc;
        }, []);
  };

  Article.numWordsByAuthor = function() {
    /* TODO: Transform each author element into an object with 2 properties:
        One for the author's name, and one for the total number of words across
        the matching articles written by the specified author. */

    return Article.allAuthors().map(function(name){
      var authorWords = {};
      authorWords.name = name;
      authorWords.numWords =

      Article.all.filter(function(article){
        if(authorWords.name === article.author){
          return article;
        }
      }).map(function(a){
        return a.body.match(/\b\w+/g).length;
      }).reduce(function(a,b){
        return a + b;
      });
      return authorWords;
    });

//     return Article.allAuthors().map(function(a) { // 'a' is a reference to an individual author.
//       return {
//         // name:
//         // numWords: someCollection.filter(function(curArticle) {
//         //  what do we return here to check for matching authors?
//         // })
//         // .map(...) // use .map to return the author's word count for each article's body (hint: regexp!).
//         // .reduce(...) // squash this array of numbers into one big number!
//       };
//     });
  };

  module.Article = Article;
})(window);

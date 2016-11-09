	import {readDocument, writeDocument, addDocument} from './database.js';

	function emulateServerReturn(data, cb) {
		setTimeout (() => {
			cb(data);
		}, 4);
	}
  /**
  * Given a feed item ID, returns a FeedItem object with references resolved.
  * Internal to the server, since it's synchronous.
  */
  function getFeedItemSync(feedItemId) {
		var feedItem = readDocument('feedItems', feedItemId);
		feedItem.likeCounter =
			feedItem.likeCounter.map((id) => readDocument('users', id));
  // Resolve 'like' counter.
  // Assuming a StatusUpdate. If we had other types of
  // FeedItems in the DB, we would
  // need to check the type and have logic for each type.
  feedItem.contents.author =
    readDocument('users', feedItem.contents.author);
  // Resolve comment author.
  feedItem.comments.forEach((comment) => {
    comment.author = readDocument('users', comment.author);
    });
    return feedItem;
   }
  /**
  * Emulates a REST call to get the feed data for a particular user.
  * @param user The ID of the user whose feed we are requesting.
  * @param cb A Function object, which we will invoke when the Feed's data is available.
  */
  export function getFeedData(user, cb) {
		var userData = readDocument('users', user);

  // Get the User object with the id "user".
  // Get the Feed object for the user.
    var feedData = readDocument('feeds', userData.feed);
  // Map the Feed's FeedItem references to actual FeedItem objects.
  // Note: While map takes a callback function as an argument, it is
  // synchronous, not asynchronous. It calls the callback immediately.
     feedData.contents = feedData.contents.map(getFeedItemSync);
  // Return FeedData with resolved references.
  // emulateServerReturn will emulate an asynchronous server operation, which
  // invokes (calls) the "cb" function some time in the future.
     emulateServerReturn(feedData, cb);
  }
/**
 * Emulates how a REST call is *asynchronous* -- it calls your function back
 * some time in the future with data.
 */

 /**
 *Adds a new status update to the database
 */
	export function postStatusUpdate(user, location, contents, cb){
		var time = new Date().getTime();
		var newStatusUpdate = {
			"likeCounter": [],
			"type": "statusUpdate",
			"contents":{
				"author":user,
				"postDate": time,
				"location": location,
				"contents": contents
			},
			"comments":[]
		};

		newStatusUpdate = addDocument('feedItems', newStatusUpdate);
		// Add the status update reference to the front of the
		// current user's feed.


		var userData = readDocument('user',user);
		var feedData = readDocument('feeds',userData.feed);
		feedData.contents.unshift(newStatusUpdate._id);

		writeDocument('feeds', feedData);
		emulateServerReturn(newStatusUpdate, cb);
 }

 export function postComment(feedItemId, author, contents, cb){

	var feedItem = readDocument('feedItems'. feedItemId);
	feedItem.comments.push({
		"author": author,
		"contents": contents,
		"postDate": new Date().getTime()
	});
	writeDocument('feedItems', feedItem);
	emulateServerReturn(getFeedItemSync(feedItemId), cb);
 }

export function likeFeedItem(feedItemId, userId, cb){
	var feedItem = readDocument('feedItem', feedItemId);
	feedItem.likeCounter.push(userId);
	writeDocument('feedItems',feedItem);
	emulateServerReturn(feedItem.likeCounter.map((userId)=>
		readDocument('users',userId)),cb);
}

export function unLikeFeedItem(feedItemId,userId,cb){
	var feedItem = readDocument('feedItem', feedItemId);
	var userIndex = feedItem.likeCounter.indexOf(userId);
	if(userIndex !== -1){
		feedItem.likeCounter.splice(userIndex, 1);
		writeDocument('feedItem', feedItem);
	}
	emulateServerReturn(feedItem.likeCounter.map((userId)=>
		readDocument('users',userId)), cb);
}

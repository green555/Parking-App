'use strict'



function CommentList() {
  
  const [currentComments, setCurrentComments] = React.useState([]);

  function onSubmit(e) {
    e.preventDefault();
    const comment = document.querySelector('#web-comment').value;
    // console.log(comment);
    const commentInput = { web_comment: comment }
    fetch('/create-web-comment', {
       method: 'POST',
       body: JSON.stringify(commentInput),
       headers: {
         'Content-Type': 'application/json',
       },
     })
     .then((response) => response.json())
     .then(data => {
      const updatedComments = [data.new_web_comment, ...currentComments];
      setCurrentComments(updatedComments.slice(0, 5));
      document.querySelector("#web-comment").value = "";

      }); // end of .then
    
  }
  
  

  // console.log('inside CommentList!');
  
  
  React.useEffect(() => {
    fetch('/get-recent-web-comments')
      .then(response => response.json())
      .then(data => setCurrentComments(data.recent_web_comments))
    
  }, [])
  
  

  return (
    <div>
      <br></br>
      <form class="row col-6">
          <div class="col-5">        
            <input class="form-control" type="text" name="web-comment" id="web-comment" placeholder="Leave your comment of this App" />
          </div>        
          <button class="btn btn-outline-secondary col-auto" id="web-comment-submit" onClick={ (e) => onSubmit(e) }>
            Submit
          </button>          
      </form>
      <br></br>
      <div className="web-comments">
        {currentComments.map(comment=>
            <WebComment 
              key={comment.comment_id}
              user_email={comment.user_email}
              comment={comment.comment} 
            />
            )
        }
      
      </div>      
    </div>
  );
}


function WebComment(props) {
  return (
    <div>
       <text>{props.user_email}: {props.comment}</text>
    </div>
    );
}





// console.log('loading the UpdateScomments.jsx file');
ReactDOM.render(<CommentList />, document.querySelector('#recent-web-comments'));

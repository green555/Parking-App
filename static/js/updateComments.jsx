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
      setCurrentComments(updatedComments.slice(0, -1));
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

      <form>
      <h2>Say something if you like this web APP</h2>
      <p>
        Comment <input type="text" name="web-comment" id="web-comment" />
      </p>
      <p>
        <button id="web-comment-submit" onClick={ (e) => onSubmit(e) }>
          Submit Comment
        </button>
      </p>  
      </form>
    </div>
  );
}


function WebComment(props) {
  return (
    <div>
       <h5>{props.user_email}</h5>
       <p>
        Comment: <code>{props.comment}</code>
       </p>
    </div>
    );
}





// console.log('loading the UpdateScomments.jsx file');
ReactDOM.render(<CommentList />, document.querySelector('#recent-web-comments'));

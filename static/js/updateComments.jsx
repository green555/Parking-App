'use strict'

function CommentList() {
  
  const [currentComments, setCurrentComments] = React.useState([]);
  
  React.useEffect(() => {
    fetch('/get-recent-web-comments')
      .then(response => response.json())
      .then(data => setCurrentComments(data.recent_web_comments))
    
  }, [])
  
  

  return (
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
  );
}


function WebComment(props) {
  return (
    <div>
       <h1>${props.user_email}</h1>
       <p>
        Comment: <code>${props.comment}</code>
       </p>
    </div>
    );
}




ReactDom.render(<CommentList />, document.querySelector('#recent-web-comments'));
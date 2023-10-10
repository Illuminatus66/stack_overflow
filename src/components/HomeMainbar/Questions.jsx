import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";

const Questions = ({ question }) => {
  return (
    <div className="display-question-container">
      <div className="display-votes-ans">
        <p>{question.vote_count}</p>
        <p>votes</p>
      </div>
      <div className="display-votes-ans">
        <p>{question.noofanswers}</p>
        <p>answers</p>
      </div>
      <div className="display-question-details">
        <Link to={`/Questions/${question.question_id}`} className="question-title-link">
          {question.questiontitle.length > (window.innerWidth <= 400 ? 70 : 90)
            ? question.questiontitle.substring(
                0,
                window.innerWidth <= 400 ? 70 : 90
              ) + "..."
            : question.questiontitle}
        </Link>
        <div className="display-tags-time">
          <div className="display-tags">
            {question.questiontags.map((tag) => (
              <p key={tag}>{tag}</p>
            ))}
          </div>
          <p className="display-time">
            asked {moment(question.askedon).fromNow()} {question.userposted}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Questions;

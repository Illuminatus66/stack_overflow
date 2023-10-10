import React from "react";
import moment from "moment";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import Avatar from "../../components/Avatar/Avatar";
import { deleteAnswer } from "../../actions/question";

const DisplayAnswer = ({ question, handleShare }) => {
  const User = useSelector((state) => state.currentUserReducer);
  const { question_id } = useParams();
  const dispatch = useDispatch();
  const handleDelete = (answer_id, noofanswers) => {
    dispatch(deleteAnswer(question_id, answer_id, noofanswers - 1));
  };
  return (
    <div>
      {question.answer.map((ans) => (
        <div className="display-ans" key={ans.answer_id}>
          <p>{ans.answerbody}</p>
          <div className="question-actions-user">
            <div>
              <button type="button" onClick={handleShare}>
                Share
              </button>
              {User?.result?.user_id === ans?.user_id && (
                <button
                  type="button"
                  onClick={() => handleDelete(ans.answer_id, question.noofanswers)}
                >
                  Delete
                </button>
              )}
            </div>
            <div>
              <p>answered {moment(ans.answeredon).fromNow()} by</p>
              <Link
                to={`/Users/${ans.user_id}`}
                className="user-link"
                style={{ color: "#0086d8" }}
              >
                <Avatar
                  backgroundColor="lightgreen"
                  px="8px"
                  py="5px"
                  borderRadius="6px"
                >
                  {ans.useranswered.charAt(0).toUpperCase()}
                </Avatar>
                <div>{ans.useranswered}</div>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayAnswer;

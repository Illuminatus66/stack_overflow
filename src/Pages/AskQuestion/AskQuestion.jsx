import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { askQuestion } from "../../actions/question";
import { FormControl, InputLabel, MenuItem, Select, Chip, TextField } from "@mui/material";
import tags from "./tagsData";
import "./AskQuestion.css";

const maxSelectedTags = 5;
const AskQuestion = () => {
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [questionTags, setQuestionTags] = useState([]);

  const dispatch = useDispatch();
  const User = useSelector((state) => state.currentUserReducer);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (User) {
      if (questionTitle && questionBody && questionTags.length > 0) {
        dispatch(
          askQuestion(
            {
              questionTitle,
              questionBody,
              questionTags,
              userPosted: User.result.name,
            },
            navigate
          )
        );
      } else {
        alert("Please enter all the fields");
      }
    } else {
      alert("Login to ask a question");
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      setQuestionBody(questionBody + "\n");
    }
  };

  const handleTagChange = (event) => {
    const selectedTags = event.target.value;
    if (selectedTags.length <= maxSelectedTags) {
      setQuestionTags(selectedTags);
    }
  };

  return (
    <div className="ask-question">
      <div className="ask-ques-container">
        <h1>Ask a public Question</h1>
        <form onSubmit={handleSubmit}>
          <div className="ask-form-container">
            <div>
              <label htmlFor="ask-ques-title">
                <h4>Title</h4>
                <p>Be specific and imagine you’re asking a question to another person</p>
                <TextField
                  id="ask-ques-title"
                  onChange={(e) => {
                    setQuestionTitle(e.target.value);
                  }}
                  placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
                  variant="outlined"
                  fullWidth
                  autoComplete="off"
                />
              </label>
            </div>
            <div>
              <label htmlFor="ask-ques-body">
                <h4>Body</h4>
                <p>Include all the information someone would need to answer your question</p>
                <TextField
                  id="ask-ques-body"
                  onChange={(e) => {
                    setQuestionBody(e.target.value);
                  }}
                  multiline
                  rows={10}
                  onKeyPress={handleEnter}
                  variant="outlined"
                  fullWidth
                  autoComplete="off"
                />
              </label>
            </div>
            <h4>Tags (select upto 5)</h4>
            <div className="ask-form-field">
              <FormControl>
                <InputLabel id="ask-ques-tags-label">Tags</InputLabel>
                <Select
                  multiple
                  labelId="ask-ques-tags-label"
                  id="ask-ques-tags"
                  value={questionTags}
                  onChange={handleTagChange}
                  renderValue={(selected) => (
                    <div>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" color="primary" style={{ marginLeft: "5px" }}/>
                      ))}
                    </div>
                  )}
                  style={{minWidth: "300px"}}
                >
                  {tags.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          <input type="submit" value="Post your question" className="review-btn" />
        </form>
      </div>
    </div>
  );
};

export default AskQuestion;

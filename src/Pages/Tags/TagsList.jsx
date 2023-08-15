import React from "react";
import "./Tags.css";

const TagsList = ({ tag }) => {
  return (
    <div className="tag">
      <a href={tag.tagLink} target="_blank" rel="noopener noreferrer">
        <h5>{tag.tagName}</h5>
      </a>
      <p>{tag.tagDesc}</p>
    </div>
  );
};

export default TagsList;

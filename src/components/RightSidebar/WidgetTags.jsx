import React from "react";

const WidgetTags = () => {
  const tags = [
    { name: "c", link: "https://www.learn-c.org/" },
    { name: "css", link: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    { name: "express", link: "https://expressjs.com/" },
    { name: "firebase", link: "https://firebase.google.com/docs" },
    { name: "html", link: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
    { name: "java", link: "https://docs.oracle.com/en/java/" },
    { name: "javascript", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    { name: "mern", link: "https://www.mongodb.com/mern-stack" },
    { name: "mongodb", link: "https://docs.mongodb.com/" },
    { name: "mysql", link: "https://dev.mysql.com/doc/" },
    { name: "next.js", link: "https://nextjs.org/docs" },
    { name: "node.js", link: "https://nodejs.org/en/docs/" },
    { name: "php", link: "https://www.php.net/manual/en/" },
    { name: "python", link: "https://docs.python.org/3/" },
    { name: "reactjs", link: "https://reactjs.org/docs/" },
  ];

  return (
    <div className="widget-tags">
      <h4>Watched tags</h4>
      <div className="widget-tags-div">
        {tags.map((tag) => (
          <a key={tag.name} href={tag.link} target="_blank" rel="noopener noreferrer" className="tag-link">
            <p>{tag.name}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default WidgetTags;

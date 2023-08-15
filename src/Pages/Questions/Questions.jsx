import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../App.css";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import HomeMainbar from "../../components/HomeMainbar/HomeMainbar";

const Questions = ({ slideIn }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("q");
    setSearchQuery(query || "");
  }, [location.search]);

  return (
    <div className="home-container-1">
      <LeftSidebar slideIn={slideIn} />
      <div className="home-container-2">
        <HomeMainbar searchQuery={searchQuery} />
        <RightSidebar />
      </div>
    </div>
  );
};

export default Questions;

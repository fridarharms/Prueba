import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  Row,
  Col,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import "./dashboard.css";
import BarCard from './BarCard'
import PieCard from './PieCard'
import TimeLineChart from "./TimeLineChart"
//import BarCard2 from './BarCard2'

function Dashboard() {
  return (
    <>
      <PanelHeader size="lg" />
      <div className="content">
        <Row>
          <Col md="4">
            <PieCard />
          </Col>
          <Col md="8">
	          <BarCard/>
          </Col>
          <Col md="12">
            <TimeLineChart/>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;

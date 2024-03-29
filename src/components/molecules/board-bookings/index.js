// @packages
import React, { useEffect, useState } from "react";
import { Card, Row } from "reactstrap";
import BoardCard from "@molecules/board-card";
import Board from "@asseinfo/react-kanban";
import Avatar from "@components/avatar";
import PropTypes from "prop-types";
import { DollarSign, TrendingUp } from "react-feather";

// @scripts
import { BOOKING_STATUS } from "@utility/Constants";

// @styles
import "./BoardBookings.scss";
import "@asseinfo/react-kanban/dist/styles.css";

const BoardBookings = ({
  filteredBookingsQuote = [],
  filteredBookingsRequested = [],
  filteredBookingsAccepted = [],
  filteredBookingsDeposit = [],
  filteredBookingsPaid = [],
  handleEditModal
}) => {
  const [loading, setLoading] = useState(true);

  const getEmptyBoard = () => {
    return {
      columns: BOOKING_STATUS.filter((element) => element.board === true).map(({ label, value }, index) => ({
        id: index,
        title: label,
        cards: []
      }))
    };
  };

  const getLoadingBoard = () => {
    return {
      columns: BOOKING_STATUS.filter((element) => element.board === true).map(({ label, value }, index) => ({
        id: index,
        title: "Loading...",
        cards: []
      }))
    };
  };

  const getBoard = () => {
    const columns = [];

    const quoteColumn = {
      id: 0,
      title: "Quote",
      cards: filteredBookingsQuote?.rows || [],
      totalBookings: filteredBookingsQuote?.total?.toFixed(2) || 0.0,
      numberOfBookings: filteredBookingsQuote?.count || 0
    };
    columns.push(quoteColumn);

    const requestedColumn = {
      id: 0,
      title: "Date/Time requested",
      cards: filteredBookingsRequested?.rows || [],
      totalBookings: filteredBookingsRequested?.total?.toFixed(2) || 0.0,
      numberOfBookings: filteredBookingsRequested?.count || 0
    };
    columns.push(requestedColumn);

    const acceptedColumn = {
      id: 0,
      title: "Date/Time accepted",
      cards: filteredBookingsAccepted?.rows || [],
      totalBookings: filteredBookingsAccepted?.total?.toFixed(2) || 0.0,
      numberOfBookings: filteredBookingsAccepted?.count || 0
    };
    columns.push(acceptedColumn);

    const depositColumn = {
      id: 0,
      title: "Deposit paid",
      cards: filteredBookingsDeposit?.rows || [],
      totalBookings: filteredBookingsDeposit?.total?.toFixed(2) || 0.0,
      numberOfBookings: filteredBookingsDeposit?.count || 0
    };
    columns.push(depositColumn);

    const finalColumn = {
      id: 0,
      title: "Paid (Full)",
      cards: filteredBookingsPaid?.rows || [],
      totalBookings: filteredBookingsPaid?.total?.toFixed(2) || 0.0,
      numberOfBookings: filteredBookingsPaid?.count || 0
    };
    columns.push(finalColumn);

    return {
      columns
    };
  };

  const [loadingBoard] = useState(getLoadingBoard());
  const [board, setBoard] = useState(getEmptyBoard());

  useEffect(() => {
    setLoading(true);
    const newBoard = getBoard();
    setBoard(newBoard);
    setLoading(false);
  }, [filteredBookingsQuote, filteredBookingsAccepted, filteredBookingsDeposit, filteredBookingsPaid, filteredBookingsRequested]);

  // Here we change the status of the dragged card
  const handleDragCard = async (booking, source, destination) => {};

  return (
    <>
      <Row>
        <Board
          renderColumnHeader={({ title, totalBookings, numberOfBookings }) => (
            <>
              <h5>
                <strong>{title}</strong>
              </h5>
              <Card className="card-board">
                <div className="d-flex justify-content-around">
                  <div className="d-flex justify-content-aorund d-flex align-items-center font-small-3 ">
                    <div>
                      <Avatar color="light-primary" icon={<TrendingUp size={18} />} />
                    </div>
                    <div className="pl-1 m-0">
                      <div>
                        <strong>{numberOfBookings}</strong>
                      </div>
                      <div className="font-small-1">Events</div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-around d-flex align-items-center font-small-3">
                    <div>
                      <Avatar className="" color="light-primary" icon={<DollarSign size={18} />} />
                    </div>
                    <div className="pl-1 m-0">
                      <div>
                        <strong>${totalBookings ? totalBookings : "0"}</strong>
                      </div>
                      <div className="font-small-1">Total</div>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
          disableColumnDrag={true}
          onNewCardConfirm={(draftCard) => ({
            id: new Date().getTime(),
            ...draftCard
          })}
          onCardDragEnd={(a, card, source, destination) => handleDragCard(card, source, destination)}
          renderCard={(cardConTent) => <BoardCard content={cardConTent} handleEditModal={handleEditModal} />}
        >
          {(!loading && board) || loadingBoard}
        </Board>
      </Row>
    </>
  );
};

BoardBookings.propTypes = {
  filteredBookingsQuote: PropTypes.object,
  filteredBookingsRequested: PropTypes.object,
  filteredBookingsAccepted: PropTypes.object,
  filteredBookingsDeposit: PropTypes.object,
  filteredBookingsPaid: PropTypes.object,
  handleEditModal: PropTypes.func
};

export default BoardBookings;

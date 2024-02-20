// @packages
import React, { forwardRef, Fragment, useState } from "react";
import Avatar from "@components/avatar";
import ReactPaginate from "react-paginate";
import DataTable from "react-data-table-component";
import { ChevronDown, Edit, FileText, File, Grid, Plus, Share, Trash, Trash2, X } from "react-feather";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalFooter,
  Row,
  UncontrolledButtonDropdown
} from "reactstrap";
import moment from "moment";
import PropTypes from "prop-types";
import { useMutation } from "@apollo/client";

// @scripts
import AddNewAttendee from "@molecules/add-new-attendee";
import UploadData from "@molecules/upload-data-attendees";
import ExportToCsv from "@molecules/export-to-csv";
import { BOOKING_CLOSED_STATUS } from "@utility/Constants";
import ExportToExcelLegacy from "@molecules/export-to-excel-legacy";
import MutationDeleteAllAttendees from "../../../graphql/MutationDeleteAllAttendees";

import "./TableAttendees.scss";

// ** Bootstrap Checkbox Component
const BootstrapCheckbox = forwardRef(({ onClick, ...rest }, ref) => (
  <div className="custom-control custom-checkbox">
    <input type="checkbox" className="custom-control-input" ref={ref} {...rest} />
    <label className="custom-control-label" onClick={onClick} />
  </div>
));

const DataTableAttendees = ({
  hasKit,
  booking,
  currentBookingId,
  attendees,
  saveAttendee,
  deleteAttendee,
  updateAttendeesCount,
  teamClassInfo,
  customer
}) => {
  // ** States
  const [currentElement, setCurrentElement] = useState(null);
  const [data, setData] = useState(attendees);
  const [modal, setModal] = useState(false);
  const [modalUpload, setModalUpload] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [mode, setMode] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteAllAteendeesModal, setDeleteAllAteendeesModal] = useState(false);
  const [elementToDelete, setElementToDelete] = useState(null);
  const [attendeesExcelTable, setAttendeesExcelTable] = useState([]);
  const [excelHeadersTemplate, setExcelHeadersTemplate] = useState([]);
  const [deleteAttendees] = useMutation(MutationDeleteAllAttendees, {});
  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal);
  // ** Function to handle Modal toggle
  const handleModalUpload = () => setModalUpload(!modalUpload);
  React.useEffect(() => {
    setData(attendees);
  }, [attendees]);

  // ** Vars
  const states = ["success", "danger", "warning", "info", "dark", "primary", "secondary"];
  const status = {
    1: { title: "Waiting", color: "light-warning" },
    2: { title: "Completed", color: "light-success" }
  };
  const getStatus = (row) => {
    return row.addressLine1 && row.city && row.state && row.zip && row.country ? 2 : 1;
  };
  // ** Custom close btn
  const CloseBtn = <X className="cursor-pointer" size={15} onClick={() => setDeleteModal(!deleteModal)} />;
  // ** Table Common Column
  const columns = [
    {
      name: "Name",
      selector: "name",
      sortable: true,
      maxWidth: "260px",
      cell: (row) => (
        <div className="d-flex align-items-center">
          <Avatar color={`${status[getStatus(row)].color}`} content={row.name} initials />
          <div className="user-info text-truncate ml-1">
            <span className="d-block font-weight-bold text-truncate">{row.name}</span>
          </div>
        </div>
      )
    },
    {
      name: "Phone",
      selector: "phone",
      sortable: true,
      maxWidth: "120px"
    },
    {
      name: "Email",
      selector: "email",
      sortable: true,
      maxWidth: "220px"
    },
    {
      name: "Address",
      selector: "addressLine",
      sortable: true,
      maxWidth: "250px",
      cell: (row) => {
        let isInternational = false;
        if (row.country && row.country !== "United States of America" && row.country !== "US" && row.country !== "USA" && row.country !== "Usa"
         && row.country !== "usa" && row.country !== "us" && row.country !== "United states" && row.country !== "United States"
         && row.country !== "UNITED STATES" && row.country !== "united states" && booking?.classVariant.hasKit) {
          isInternational = true;
        } 
        return (
          <div style={{ color: "#868E96", fontWeight: "400", fontSize: "12px", lineHeight: "18px" }}>
              {row?.addressLine1 ? row?.addressLine1 : ""} {row?.addressLine2 ? row?.addressLine2 : ""}
              {row?.city ? row?.city.concat(",") : ""} {row?.state ? row?.state : ""} {row?.country ? row.country : ""}{" "}
              {row?.zip ? row?.zip : ""}{" "}{isInternational && <Badge color="primary">International</Badge>}
            </div>
        );
      }
    },
    {
      name: "deliveryStatus",
      selector: "kitFullFitment",
      sortable: true,
      maxWidth: "250px",
      cell: (row) => {
        return (
          <a href={`${process.env.REACT_APP_PUBLIC_MAIN_WEBSITE_URL}/track/${row._id}`} target="_blank">
            <div  className={!row.kitFullFitment ? "" : row.kitFullFitment?.status === "Delivered" ? "attendees-delivery-delivered" :
              row.kitFullFitment?.status === "InfoReceived" ? "attendees-delivery-info-received" :
              row.kitFullFitment?.status === "AvailableForPickup" ? "attendees-delivery-info-received" : 
              row.kitFullFitment?.status === "InTransit" ? "attendees-delivery-in-transit" :
              row.kitFullFitment?.status === "OutForDelivery" ? "attendees-delivery-out-for-delivery" : "attendees-delivery-other"}>
              <span>{!row.kitFullFitment ? "" : row.kitFullFitment?.status === "AvailableForPickup" ? "Pickup" : row?.kitFullFitment?.status || "Shipped"}</span>
          </div>
          </a>
        );
      }
    },
    {
      name: "Status",
      selector: "status",
      sortable: true,
      maxWidth: "120px",
      cell : (row) => {
        if (row.status === null) {
          return "confirmed";
        } else {
          return row.status;
        }
      }
    },
    {
      name: "Actions",
      allowOverflow: true,
      maxWidth: "30px",
      cell: (row) => {
        return (
          <div className="d-flex ">
            <a
              className="mr-2"
              onClick={(e) => {
                e.preventDefault();
                setElementToDelete(row);
                setDeleteModal(!deleteModal);
              }}
              href="#"
              title="Remove from list"
            >
              <Trash size={18} />
            </a>
            <a
              onClick={(e) => {
                setCurrentElement(row);
                handleModal();
                setMode("edit");
              }}
              href="#"
              title="Edit attendee"
            >
              <Edit size={18} title="Edit" />
            </a>
          </div>
        );
      }
    }
  ];
  React.useEffect(() => {
    if (attendees && teamClassInfo) {
      if (attendees && teamClassInfo) {
        const fields = [
          ...(booking?.classVariant?.registrationFields || teamClassInfo?.registrationFields || []),
          ...(booking?.signUpPageSettings?.additionalRegistrationFields || [])
        ];
        // setRegistrationFields(fields.filter((element) => element.active === true));

        const attendeesArray = [];
        const headers = ["Name", "Email", "Phone", "AddressLine1", "AddressLine2", "City", "State", "Zip", "Country", "Status"];
        const templateHeaders = ["Name", "Email", "Phone", "AddressLine1", "AddressLine2", "City", "State", "Zip", "Country"];
        fields.forEach((dynamicField) => headers.push(dynamicField.label));
        teamClassInfo.variants.map((item) => {
          if (item.kitHasAlcohol) headers.push("Delivery Restriction");
        });
        attendeesArray.push(headers);

        for (const i in attendees) {
          const attendeeInfo = attendees[i];
          const row = [
            attendeeInfo.name,
            attendeeInfo.email,
            attendeeInfo.phone,
            attendeeInfo.addressLine1,
            attendeeInfo.addressLine2,
            attendeeInfo.city,
            attendeeInfo.state,
            attendeeInfo.zip,
            attendeeInfo.country,
            attendeeInfo.status
          ];

          attendeeInfo?.additionalFields?.forEach((dynamicField) => row.push(dynamicField.value));

          if (attendeeInfo.canDeliverKitReason) row.push(attendeeInfo.canDeliverKitReason);

          attendeesArray.push(row);
        }

        setExcelHeadersTemplate([templateHeaders]);
        setAttendeesExcelTable(attendeesArray);
      }
    }
  }, [attendees, teamClassInfo]);
  // ** Function to handle filter
  const handleFilter = (e) => {
    const value = e.target.value;
    let updatedData = [];
    setSearchValue(value);
    if (value.length) {
      updatedData = data.filter((item) => {
        const startsWith =
          (item.name && item.name.toLowerCase().startsWith(value.toLowerCase())) ||
          (item.phone && item.phone.toLowerCase().startsWith(value.toLowerCase())) ||
          (item.email && item.email.toLowerCase().startsWith(value.toLowerCase())) ||
          (item.address1 && item.address1.toLowerCase().startsWith(value.toLowerCase())) ||
          (item.address2 && item.address2.toLowerCase().startsWith(value.toLowerCase())) ||
          (item.city && item.city.toLowerCase().startsWith(value.toLowerCase())) ||
          (item.state && item.state.toLowerCase().startsWith(value.toLowerCase())) ||
          (item.zip && item.zip.toLowerCase().startsWith(value.toLowerCase())) ||
          (item.country && item.country.toLowerCase().startsWith(value.toLowerCase()));
        const includes =
          (item.name && item.name.toLowerCase().includes(value.toLowerCase())) ||
          (item.phone && item.phone.toLowerCase().includes(value.toLowerCase())) ||
          (item.email && item.email.toLowerCase().includes(value.toLowerCase())) ||
          (item.address1 && item.address1.toLowerCase().includes(value.toLowerCase())) ||
          (item.address2 && item.address2.toLowerCase().includes(value.toLowerCase())) ||
          (item.city && item.city.toLowerCase().includes(value.toLowerCase())) ||
          (item.state && item.state.toLowerCase().includes(value.toLowerCase())) ||
          (item.zip && item.zip.toLowerCase().includes(value.toLowerCase())) ||
          (item.country && item.country.toLowerCase().includes(value.toLowerCase()));
        return startsWith || includes;
      });
      setFilteredData(updatedData);
      setSearchValue(value);
    }
  };
  // ** Function to handle Pagination
  const handlePagination = (page) => {
    setCurrentPage(page.selected);
  };
  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=""
      nextLabel=""
      forcePage={currentPage}
      onPageChange={(page) => handlePagination(page)}
      pageCount={searchValue.length ? filteredData.length / 7 : data.length / 7 || 1}
      breakLabel="..."
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName="active"
      pageClassName="page-item"
      breakClassName="page-item"
      breakLinkClassName="page-link"
      nextLinkClassName="page-link"
      nextClassName="page-item next"
      previousClassName="page-item prev"
      previousLinkClassName="page-link"
      pageLinkClassName="page-link"
      containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1"
    />
  );

  return (
    <Fragment>
      <Card>
        <CardHeader tag="h4" className="border-bottom ">
          <div className="d-flex flex-column bd-highlight">
            <p className="bd-highlight mb-0">Your list of attendees</p>
            <p className="bd-highlight">
              <small>
                {" Attendees registered: "}
                <Badge color="primary"> {`${data.length || 0}`}</Badge>
              </small>
            </p>
          </div>
          <CardTitle className="d-flex justify-content-end">
            <div className="d-flex justify-content-end">
              <div>
                <UncontrolledButtonDropdown size="sm">
                  <DropdownToggle color="secondary" caret outline>
                    <Share size={15} />
                    <span className="align-middle ml-50">Bulk actions</span>
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem className="align-middle w-100">
                      <ExportToExcelLegacy
                        apiData={excelHeadersTemplate}
                        fileName={"Template"}
                        title={
                          <h6>
                            <FileText size={13} />
                            {"  Download template"}
                          </h6>
                        }
                        smallText={<h6 className="small m-0 p-0">Use this template to build your list</h6>}
                      />
                    </DropdownItem>
                    {booking && booking.status !== BOOKING_CLOSED_STATUS && (
                      <DropdownItem className="w-100" onClick={handleModalUpload}>
                        <>
                          <h6>
                            <Grid size={15} /> Upload data
                          </h6>
                          <small>Excel file with your attendees</small>
                        </>
                      </DropdownItem>
                    )}
                    {attendees?.length > 0 && (
                      <>
                        <DropdownItem className="align-middle w-100">
                          <ExportToExcelLegacy
                            apiData={attendeesExcelTable}
                            fileName={`${customer && customer.name}${customer && customer.company ? ", " : ""}${
                              customer && customer.company ? customer.company : ""
                            }-${moment().format("LL")}-${teamClassInfo.title}`}
                            title={
                              <h6>
                                <FileText size={13} />
                                {"   Excel File"}
                              </h6>
                            }
                            smallText={<h6 className="small m-0 p-0">Download excel file with attendees</h6>}
                          />
                        </DropdownItem>
                        <DropdownItem className="align-middle w-100">
                          <ExportToCsv
                            array={attendees}
                            name={`${customer && customer.name}${customer && customer.company ? ", " : ""}${
                              customer && customer.company ? customer.company : ""
                            }-${moment().format("LL")}-${teamClassInfo.title}.csv`}
                            title={
                              <h6>
                                <File size={13} />
                                {"   Csv File"}
                              </h6>
                            }
                            smallText={<h6 className="small m-0 p-0">Download csv file with attendees</h6>}
                            teamClassInfo={teamClassInfo}
                          />
                        </DropdownItem>
                        <DropdownItem className="align-middle w-100"  onClick={e => setDeleteAllAteendeesModal(!deleteAllAteendeesModal)}>
                          <h6>
                            <Trash2 size={15} /> Delete attendees
                          </h6>
                          <small>Remove all the attendees</small>
                        </DropdownItem>
                      </>
                    )}
                  </DropdownMenu>
                </UncontrolledButtonDropdown>
              </div>
              <div>
                {booking && booking.status !== BOOKING_CLOSED_STATUS && (
                  <Button
                    className="ml-2"
                    color="primary"
                    onClick={(e) => {
                      setMode("new");
                      const newElementTemplate = {
                        city: "",
                        phone: "",
                        bookingId: currentBookingId,
                        zip: "",
                        addressLine1: "",
                        addressLine2: "",
                        email: "",
                        country: "",
                        name: "",
                        state: "",
                        dinamycValues: []
                      };
                      setCurrentElement(newElementTemplate);
                      handleModal();
                    }}
                    size="sm"
                  >
                    <Plus size={15} />
                    <span className="align-middle ml-50">Add Attendee</span>
                  </Button>
                )}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <Row className="justify-content-end mx-0">
          <Col className="d-flex align-items-center justify-content-end mt-1 mb-1" md="6" sm="12">
            <Label className="mr-1" for="search-input">
              Search
            </Label>
            <Input className="dataTable-filter mb-50" type="text" bsSize="sm" id="search-input" value={searchValue} onChange={handleFilter} />
          </Col>
        </Row>
        <DataTable
          className="react-dataTable"
          columns={columns}
          data={searchValue.length ? filteredData : data}
          noHeader
          pagination
          paginationComponent={CustomPagination}
          paginationDefaultPage={currentPage + 1}
          paginationPerPage={7}
          selectableRowsComponent={BootstrapCheckbox}
          sortIcon={<ChevronDown size={10} />}
        />
      </Card>
      <AddNewAttendee
        open={modal}
        handleModal={handleModal}
        currentBookingId={currentBookingId}
        currentElement={currentElement}
        saveAttendee={saveAttendee}
        data={data}
        setData={setData}
        updateAttendeesCount={updateAttendeesCount}
        mode={mode}
        teamClassInfo={teamClassInfo}
        hasKit={hasKit}
        booking={booking}
      />
      <UploadData
        open={modalUpload}
        handleModal={handleModalUpload}
        currentBookingId={currentBookingId}
        saveAttendee={saveAttendee}
        data={data}
        setData={setData}
        updateAttendeesCount={updateAttendeesCount}
        teamClassInfo={teamClassInfo}
        booking={booking}
      />
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(!deleteModal)} backdrop={false} className="modal-dialog-centered border-0">
        <ModalHeader toggle={() => setDeleteModal(!deleteModal)} close={CloseBtn}>
          Are you sure to delete {elementToDelete && elementToDelete.name}'s registration?
        </ModalHeader>
        <ModalFooter className="justify-content-center">
          <Button
            color="secondary"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setElementToDelete(null);
              setDeleteModal(!deleteModal);
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            size="sm"
            onClick={async (e) => {
              e.preventDefault();
              if (!elementToDelete) return;
              const result = await deleteAttendee(elementToDelete._id);
              if (result) {
                const newData = data.filter((element) => element._id !== elementToDelete._id);
                setData(newData);
                updateAttendeesCount(newData.length);
                setDeleteModal(!deleteModal);
              }
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={deleteAllAteendeesModal} toggle={() => setDeleteAllAteendeesModal(!deleteAllAteendeesModal)} backdrop={false} className="modal-dialog-centered border-0">
        <ModalHeader toggle={() => setDeleteAllAteendeesModal(!deleteAllAteendeesModal)} close={CloseBtn}>
          Are you sure you want to delete all the attendees?
        </ModalHeader>
        <ModalFooter className="justify-content-center">
          <Button
            color="secondary"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setDeleteAllAteendeesModal(!deleteAllAteendeesModal);
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            size="sm"
            onClick={async (e) => {
              try {
                const allIds = data.map((attendee) => attendee._id);
                const result = await deleteAttendees({
                  variables: {
                    ids: allIds
                  }
                });
                updateAttendeesCount(0);
                setData([]);
                setDeleteAllAteendeesModal(!deleteAllAteendeesModal);
              } catch (err) {
                console.log("Something went wrong: ", err);
              }
            }}
          >
            Delete All
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

DataTableAttendees.propTypes = {
  hasKit: PropTypes.bool,
  booking: PropTypes.object,
  currentBookingId: PropTypes.string,
  attendees: PropTypes.number,
  saveAttendee: PropTypes.func,
  deleteAttendee: PropTypes.func,
  updateAttendeesCount: PropTypes.func,
  teamClassInfo: PropTypes.object,
  customer: PropTypes.object
};

export default DataTableAttendees;

import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { apolloClient } from '../../utility/RealmApolloClient';
import { Briefcase, Calendar, Check, DollarSign, Edit2, Mail, Phone, TrendingUp, User, Users } from 'react-feather';
import { Badge, Button, Card, CardBody, CardTitle, CardText, CardFooter, Col, Row } from 'reactstrap';
import Avatar from '@components/avatar';
import moment from 'moment';

import queryGetBookingsWithCriteria from '../../graphql/QueryGetBookingsWithCriteria';
import CopyClipboard from '../../components/CopyClipboard';
import { capitalizeString } from '../../utility/Utils';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';
import NumberFilter from '@inovua/reactdatagrid-community/NumberFilter';
import DateFilter from '@inovua/reactdatagrid-community/DateFilter';

import '@inovua/reactdatagrid-enterprise/index.css';
import '@inovua/reactdatagrid-enterprise/theme/default-light.css';
import '@inovua/reactdatagrid-enterprise/theme/amber-dark.css';
import './BookingsTable.scss';

const renderRowDetails = ({ data }) => {
  console.log('data', data);
  return (
    <div style={{ padding: 20 }}>
      <h4 className="mb-1">{capitalizeString(data.customerName)}</h4>
      <table>
        <tbody>
          <tr>
            <td>Phone</td>
            <td>
              <Phone size={18} /> {data.customerPhone} <CopyClipboard text={data.customerPhone} />
            </td>
          </tr>
          <tr>
            <td>Email</td>
            <td>
              <Mail size={18} /> {data.customerEmail} <CopyClipboard className="z-index-2" text={data.customerEmail} />
            </td>
          </tr>
          {data.customerCompany && (
            <tr>
              <td>Company</td>
              <td>
                <Briefcase size={18} /> {data.customerCompany}
              </td>
            </tr>
          )}
          <tr>
            <td>
              <strong>Booking ID</strong>
            </td>
            <td>{data._id}</td> <CopyClipboard className="z-index-2" text={data._id} />
          </tr>
          <tr>
            <td>Class:</td>
            <td>{data.className}</td>
          </tr>
          <tr>
            {data.classVariant && (
              <>
                <td>Option</td>
                <td>
                  {data.classVariant.title} {`$${data.classVariant.pricePerson}`} {data.classVariant.groupEvent ? '/group' : '/person'}
                </td>
              </>
            )}
          </tr>
          <tr>
            <td>Event Date</td>
            <td>
              <Calendar size={18} /> {data.eventDateTime ? moment(data.eventDateTime).format('LLL') : 'TBD'}
            </td>
          </tr>
          <tr>
            <td>Attendees</td>
            <td>{data.attendees}</td>
          </tr>
          <tr>
            <td>International attendees</td>
            <td>{data.hasInternationalAttendees ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Created</td>
            <td>{moment(data.createdAt).format('LL')}</td>
          </tr>
          <tr>
            <td>Updated</td>
            <td>{moment(data.updatedAt).format('LL')}</td>
          </tr>

          <tr>
            <td>Actions</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const DataGrid = () => {
  const skin = useSelector((state) => state.bookingsBackground);
  const [status, setStatus] = useState({ value: 'quote', label: 'Quote' });
  const history = useHistory();

  const handleEdit = (rowId) => {
    history.push(`/booking/${rowId}`);
  };

  const gridStyle = { minHeight: 600, marginTop: 10 };

  const columns = [
    {
      name: 'createdAt',
      header: 'Created',
      type: 'date',
      filterEditor: DateFilter,
      render: ({ value, cellProps }) => {
        return moment(value).calendar(null, {
          lastDay: '[Yesterday]',
          sameDay: 'LT',
          lastWeek: 'dddd',
          sameElse: 'MMMM Do, YYYY'
        });
      }
    },
    {
      name: 'updatedAt',
      header: 'Updated',
      type: 'date',
      filterEditor: DateFilter,
      render: ({ value, cellProps }) => {
        return moment(value).calendar(null, {
          lastDay: '[Yesterday]',
          sameDay: 'LT',
          lastWeek: 'dddd',
          sameElse: 'MMMM Do, YYYY'
        });
      },
      defaultVisible: false
    },
    { name: 'status', header: 'Status', type: 'string', defaultVisible: false },
    { name: '_id', header: 'Id', type: 'string' },
    { name: 'customerName', header: 'Customer ', type: 'string' },
    { name: 'customerEmail', header: 'Email ', type: 'string' },
    { name: 'customerPhone', header: 'Phone ', type: 'number', defaultVisible: false },
    { name: 'customerCompany', header: 'Company ', type: 'string' },
    { name: 'className', header: 'Class ', type: 'string' },
    {
      name: 'attendees',
      header: '# ',
      type: 'number',
      filterEditor: NumberFilter,
      defaultWidth: 112,
      render: ({ value, cellProps }) => {
        if (value) {
          return <span className="float-right">{value}</span>;
        }
      }
    },
    {
      name: 'eventDateTime',
      header: 'Event date',
      type: 'date',
      filterEditor: DateFilter,
      render: ({ value, cellProps }) => {
        console.log('cellProps', cellProps.data);
        if (value) {
          return moment(value).format('LLL');
        }
      }
    },
    {
      name: 'actions',
      header: 'Actions',
      defaultWidth: 200,
      render: ({ value, cellProps }) => {
        if (cellProps.data) {
          return cellProps.data.status === 'quote' ? (
            <small>
              <div className="d-flex">
                <a
                  className="mr-1"
                  href={`https://www.teamclass.com/booking/select-date-time/${cellProps.data._id}`}
                  target={'_blank'}
                  title={'Select date and time link'}
                >
                  <Avatar color="light-primary" size="sm" icon={<Calendar />} />
                </a>
                <a className="mr-1" onClick={() => handleEdit(cellProps.data._id)} target={'_blank'} title={'Time / Attendees / Invoice Builder'}>
                  <Avatar color="light-dark" size="sm" icon={<Edit2 />} />
                </a>
              </div>
            </small>
          ) : cellProps.data.status === 'date-requested' &&
            cellProps.data.eventDateTimeStatus &&
            cellProps.data.eventDateTimeStatus === 'reserved' ? (
              <small>
                <div className="d-flex">
                  <a
                    className="mr-1"
                    href={`https://www.teamclass.com/booking/select-date-time/${cellProps.data._id}`}
                    target={'_blank'}
                    title={'Select date and time link'}
                  >
                    <Avatar color="light-primary" size="sm" icon={<Calendar />} />
                  </a>
                  <a
                    className="mr-1"
                    href={`https://www.teamclass.com/booking/date-time-confirmation/${cellProps.data._id}`}
                    target={'_blank'}
                    title={'Approve/Reject link'}
                  >
                    <Avatar color="light-primary" size="sm" icon={<Check />} />
                  </a>
                  <a className="mr-1" onClick={() => handleEdit(cellProps.data._id)} target={'_blank'} title={'Time / Attendees / Invoice Builder'}>
                    <Avatar color="light-dark" size="sm" icon={<Edit2 />} />
                  </a>
                </div>
              </small>
            ) : cellProps.data.status === 'date-requested' &&
            cellProps.data.eventDateTimeStatus &&
            cellProps.data.eventDateTimeStatus === 'confirmed' ? (
                <small>
                  <div className="d-flex">
                    <a
                      className="mr-1"
                      href={`https://www.teamclass.com/booking/select-date-time/${cellProps.data._id}`}
                      target={'_blank'}
                      title={'Select date and time link'}
                    >
                      <Avatar color="light-primary" size="sm" icon={<Calendar />} />
                    </a>
                    <a
                      className="mr-1"
                      href={`https://www.teamclass.com/booking/event-confirmation/${cellProps.data._id}`}
                      target={'_blank'}
                      title={'Deposit link'}
                    >
                      <Avatar color="light-primary" size="sm" icon={<DollarSign />} />
                    </a>
                    <a className="mr-1" onClick={() => handleEdit(cellProps.data._id)} target={'_blank'} title={'Time / Attendees / Invoice Builder'}>
                      <Avatar color="light-dark" size="sm" icon={<Edit2 />} />
                    </a>
                  </div>
                </small>
              ) : cellProps.data.status === 'date-requested' &&
            cellProps.data.eventDateTimeStatus &&
            cellProps.data.eventDateTimeStatus === 'rejected' ? (
                  <small>
                    <div className="d-flex">
                      <a
                        className="mr-1"
                        href={`https://www.teamclass.com/booking/select-date-time/${cellProps.data._id}`}
                        target={'_blank'}
                        title={'Select date and time link'}
                      >
                        <Avatar color="light-primary" size="sm" icon={<Calendar />} />
                      </a>
                      <a className="mr-1" onClick={() => handleEdit(cellProps.data._id)} title={'Time / Attendees / Invoice Builder'}>
                        <Avatar color="light-dark" size="sm" icon={<Edit2 />} />
                      </a>
                    </div>
                  </small>
                ) : cellProps.data.status === 'confirmed' ? (
                  <small>
                    <div className="d-flex">
                      <a
                        className="mr-1"
                        href={`https://www.teamclass.com/booking/select-date-time/${cellProps.data._id}`}
                        target={'_blank'}
                        title={'Select date and time link'}
                      >
                        <Avatar color="light-primary" size="sm" icon={<Calendar />} />
                      </a>
                      <a className="mr-1" href={`https://www.teamclass.com/event/${cellProps.data._id}`} target={'_blank'} title={'Sign-up link'}>
                        <Avatar color="light-primary" size="sm" icon={<User />} />
                      </a>
                      <a className="mr-1" href={`https://www.teamclass.com/signUpStatus/${cellProps.data._id}`} target={'_blank'} title={'Sign-up status'}>
                        <Avatar color="light-primary" size="sm" icon={<Users />} />
                      </a>
                      <a
                        className="mr-1"
                        href={`https://www.teamclass.com/booking/payment/${cellProps.data._id}`}
                        target={'_blank'}
                        title={'Final payment link'}
                      >
                        <Avatar color="secondary" size="sm" icon={<DollarSign />} />
                      </a>
                      <a className="mr-1" onClick={() => handleEdit(cellProps.data._id)} target={'_blank'} title={'Time / Attendees / Invoice Builder'}>
                        <Avatar color="light-dark" size="sm" icon={<Edit2 />} />
                      </a>
                    </div>
                  </small>
                ) : (
                  cellProps.data.status === 'paid' && (
                    <small>
                      <div className="d-flex">
                        <a
                          className="mr-1"
                          href={`https://www.teamclass.com/booking/select-date-time/${cellProps.data._id}`}
                          target={'_blank'}
                          title={'Select date and time link'}
                        >
                          <Avatar color="light-primary" size="sm" icon={<Calendar />} />
                        </a>
                        <a className="mr-1" href={`https://www.teamclass.com/event/${cellProps.data._id}`} target={'_blank'} title={'Sign-up link'}>
                          <Avatar color="light-primary" size="sm" icon={<User />} />
                        </a>
                        <a
                          className="mr-1"
                          href={`https://www.teamclass.com/signUpStatus/${cellProps.data._id}`}
                          target={'_blank'}
                          title={'Sign-up status'}
                        >
                          <Avatar color="light-primary" size="sm" icon={<Users />} />
                        </a>
                        <a
                          className="mr-1"
                          href={`https://www.teamclass.com/booking/payment/${cellProps.data._id}`}
                          target={'_blank'}
                          title={'Final payment link'}
                        >
                          <Avatar color="secondary" size="sm" icon={<DollarSign />} />
                        </a>
                        <a className="mr-1" onClick={() => handleEdit(cellProps.data._id)} target={'_blank'} title={'Time / Attendees / Invoice Builder'}>
                          <Avatar color="light-dark" size="sm" icon={<Edit2 />} />
                        </a>
                      </div>
                    </small>
                  )
                );
        }
      }
    }
    // {
    //   header: 'Total',
    //   type: 'number',
    //   filterEditor: NumberFilter
    // },
    // {
    //   header: 'Deposit Paid',
    //   type: 'number',
    //   filterEditor: NumberFilter
    // },
    // {
    //   header: 'Final Paid',
    //   type: 'number',
    //   filterEditor: NumberFilter
    // },
    // {
    //   header: 'Balance',
    //   type: 'number',
    //   filterEditor: NumberFilter
    // }
  ];

  const defaultFilterValue = [
    { name: 'createdAt', type: 'date', operator: 'before', value: undefined },
    { name: 'updatedAt', type: 'date', operator: 'before', value: undefined },
    { name: 'status', type: 'string', operator: 'contains', value: status.value },
    { name: '_id', type: 'string', operator: 'contains', value: '' },
    { name: 'customerName', type: 'string', operator: 'contains', value: '' },
    { name: 'customerEmail', type: 'string', operator: 'contains', value: '' },
    { name: 'customerPhone', type: 'string', operator: 'contains', value: '' },
    { name: 'customerCompany', type: 'string', operator: 'contains', value: '' },
    { name: 'className', type: 'string', operator: 'contains', value: '' },
    { name: 'attendees', type: 'number', operator: 'gte', value: 10 },
    { name: 'eventDateTime', type: 'date', operator: 'before', value: undefined }
  ];

  const loadData = ({ skip, limit, sortInfo, groupBy, filterValue }) => {
    console.log('limit', limit);
    console.log('sortInfo', sortInfo);
    console.log('filterValue', filterValue);

    const filters = filterValue
      .filter((item) => item.value !== null && item.value !== undefined && item.value !== '')
      .map(({ name, type, operator, value }) => {
        if (type === 'number' && (operator === 'inrange' || operator === 'notinrange')) return { name, type, operator, valueRangeNum: value };
        if (type === 'date' && (operator === 'inrange' || operator === 'notinrange')) return { name, type, operator, valueRange: value };
        if (type === 'number') return { name, type, operator, valueNum: value };
        return { name, type, operator, value };
      });

    console.log('filters', filters);
    return apolloClient
      .query({
        query: queryGetBookingsWithCriteria,
        variables: {
          limit,
          offset: skip,
          sortBy: sortInfo,
          filterBy: filters
        }
      })
      .then((response) => {
        console.log('entró', response);
        const totalCount = response.data.getBookingsWithCriteria.count;
        return { data: response.data.getBookingsWithCriteria.rows, count: totalCount };
      });
    // return { data: [], count: 0 };
  };

  const [filterValue, setFilterValue] = useState(defaultFilterValue);
  const [sortInfo, setSortInfo] = useState([]);
  const dataSource = useCallback(loadData, []);
  const [filteredRows, setFilteredRows] = useState(null);
  const [expandedRows, setExpandedRows] = useState({ 1: true, 2: true });
  const [collapsedRows, setCollapsedRows] = useState(null);
  const [cellSelection, setCellSelection] = useState({});

  const onExpandedRowsChange = useCallback(({ expandedRows, collapsedRows }) => {
    setExpandedRows(expandedRows);
    setCollapsedRows(collapsedRows);
  }, []);

  const onCopySelectedCellsChange = useCallback((cells) => {
    console.log(cells);
  }, []);

  const onPasteSelectedCellsChange = useCallback((cells) => {
    console.log(cells);
  }, []);

  // console.log('ReactDataGrid', ReactDataGrid.defaultProps.i18n);
  console.log('ReactDataGrid', ReactDataGrid.rowProps);

  return (
    <div>
      <Row className="d-flex justify-content-between mt-1">
        <Col md="6" xl="2">
          <Card className="">
            <CardBody className="pt-1 pb-1">
              <CardTitle className="text-center mb-0 ">
                <h6>Quote</h6>
              </CardTitle>
              <CardText>
                <div className="d-flex justify-content-start d-flex align-items-center font-small-3 ">
                  <div>
                    <Avatar color="light-primary" icon={<TrendingUp size={18} />} />
                  </div>
                  <div className="pl-1 m-0">
                    <div>
                      <strong>459</strong>
                    </div>
                    <div className="font-small-1">Events</div>
                  </div>
                </div>
                <div className="d-flex justify-content-start d-flex align-items-center font-small-3">
                  <div>
                    <Avatar className="" color="light-primary" icon={<DollarSign size={18} />} />
                  </div>
                  <div className="pl-1 m-0">
                    <div>
                      <strong>$153,596.36</strong>
                    </div>
                    <div className="font-small-1">Total</div>
                  </div>
                </div>
              </CardText>
            </CardBody>
            <CardFooter className="pt-1 pb-1 d-flex justify-content-center">
              <Button
                color="primary"
                outline
                className="  btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  setStatus({ value: 'quote', label: 'Quote' });
                }}
              >
                Details
              </Button>
            </CardFooter>
          </Card>
        </Col>
        <Col md="6" xl="2">
          <Card>
            <CardBody className="pt-1 pb-1">
              <CardTitle className="text-center mb-0">
                <h6>Requested </h6>
              </CardTitle>
              <CardText>
                <div className="d-flex justify-content-start d-flex align-items-center font-small-3 ">
                  <div>
                    <Avatar color="light-primary" icon={<TrendingUp size={18} />} />
                  </div>
                  <div className="pl-1 m-0">
                    <div>
                      <strong>459</strong>
                    </div>
                    <div className="font-small-1">Events</div>
                  </div>
                </div>
                <div className="d-flex justify-content-start d-flex align-items-center font-small-3">
                  <div>
                    <Avatar className="" color="light-primary" icon={<DollarSign size={18} />} />
                  </div>
                  <div className="pl-1 m-0">
                    <div>
                      <strong>$153,596.36</strong>
                    </div>
                    <div className="font-small-1">Total</div>
                  </div>
                </div>
              </CardText>
            </CardBody>
            <CardFooter className="pt-1 pb-1 d-flex justify-content-center">
              <Button
                color="primary"
                outline
                className=" m-0 btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  setStatus({ value: 'date-requested', label: 'Requested' });
                }}
              >
                Details
              </Button>
            </CardFooter>
          </Card>
        </Col>
        <Col md="6" xl="2">
          <Card>
            <CardBody className="pt-1 pb-1">
              <CardTitle className="text-center mb-0">
                <h6>Rejected</h6>
              </CardTitle>
              <CardText>
                <div className="d-flex justify-content-start d-flex align-items-center font-small-3 ">
                  <div>
                    <Avatar color="light-primary" icon={<TrendingUp size={18} />} />
                  </div>
                  <div className="pl-1 m-0">
                    <div>
                      <strong>459</strong>
                    </div>
                    <div className="font-small-1">Events</div>
                  </div>
                </div>
                <div className="d-flex justify-content-start d-flex align-items-center font-small-3">
                  <div>
                    <Avatar className="" color="light-primary" icon={<DollarSign size={18} />} />
                  </div>
                  <div className="pl-1 m-0">
                    <div>
                      <strong>$153,596.36</strong>
                    </div>
                    <div className="font-small-1">Total</div>
                  </div>
                </div>
              </CardText>
            </CardBody>
            <CardFooter className="pt-1 pb-1 d-flex justify-content-center">
              <Button
                color="primary"
                outline
                className=" m-0 btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  setStatus({ value: 'canceled', label: 'Rejected' });
                }}
              >
                Details
              </Button>
            </CardFooter>
          </Card>
        </Col>
        <Col md="6" xl="2">
          <Card>
            <CardBody className="pt-1 pb-1">
              <CardTitle className="text-center mb-0">
                <h6>Accepted</h6>
              </CardTitle>
              <CardText>
                <div className="d-flex justify-content-start d-flex align-items-center font-small-3 ">
                  <div>
                    <Avatar color="light-primary" icon={<TrendingUp size={18} />} />
                  </div>
                  <div className="pl-1 m-0">
                    <div>
                      <strong>459</strong>
                    </div>
                    <div className="font-small-1">Events</div>
                  </div>
                </div>
                <div className="d-flex justify-content-start d-flex align-items-center font-small-3">
                  <div>
                    <Avatar className="" color="light-primary" icon={<DollarSign size={18} />} />
                  </div>
                  <div className="pl-1 m-0">
                    <div>
                      <strong>$153,596.36</strong>
                    </div>
                    <div className="font-small-1">Total</div>
                  </div>
                </div>
              </CardText>
            </CardBody>
            <CardFooter className="pt-1 pb-1 d-flex justify-content-center">
              <Button
                color="primary"
                outline
                className=" m-0 btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  setStatus({ value: 'confirmed', label: 'Accepted' });
                }}
              >
                Details
              </Button>
            </CardFooter>
          </Card>
        </Col>
        <Col md="6" xl="2">
          <Card>
            <CardBody className="pt-1 pb-1">
              <CardTitle className="text-center mb-0">
                <h6>Deposit paid</h6>
              </CardTitle>
              <CardText>
                <div className="d-flex justify-content-start d-flex align-items-center font-small-3 ">
                  <div>
                    <Avatar color="light-primary" icon={<TrendingUp size={18} />} />
                  </div>
                  <div className="pl-1 m-0">
                    <div>
                      <strong>459</strong>
                    </div>
                    <div className="font-small-1">Events</div>
                  </div>
                </div>
                <div className="d-flex justify-content-start d-flex align-items-center font-small-3">
                  <div>
                    <Avatar className="" color="light-primary" icon={<DollarSign size={18} />} />
                  </div>
                  <div className="pl-1 m-0">
                    <div>
                      <strong>$153,596.36</strong>
                    </div>
                    <div className="font-small-1">Total</div>
                  </div>
                </div>
              </CardText>
            </CardBody>
            <CardFooter className="pt-1 pb-1 d-flex justify-content-center">
              <Button
                color="primary"
                outline
                className=" m-0 btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  setStatus({ value: 'paid', label: 'Deposit paid' });
                }}
              >
                Details
              </Button>
            </CardFooter>
          </Card>
        </Col>
        <Col md="6" xl="2">
          <Card>
            <CardBody className="pt-1 pb-1">
              <CardTitle className="text-center mb-0">
                <h6>Paid</h6>
              </CardTitle>
              <CardText>
                <div className="d-flex justify-content-start d-flex align-items-center font-small-3 ">
                  <div>
                    <Avatar color="light-primary" icon={<TrendingUp size={18} />} />
                  </div>
                  <div className="pl-1 m-0">
                    <div>
                      <strong>459</strong>
                    </div>
                    <div className="font-small-1">Events</div>
                  </div>
                </div>
                <div className="d-flex justify-content-start d-flex align-items-center font-small-3">
                  <div>
                    <Avatar className="" color="light-primary" icon={<DollarSign size={18} />} />
                  </div>
                  <div className="pl-1 m-0">
                    <div>
                      <strong>$153,596.36</strong>
                    </div>
                    <div className="font-small-1">Total</div>
                  </div>
                </div>
              </CardText>
            </CardBody>
            <CardFooter className="pt-1 pb-1 d-flex justify-content-center">
              <Button
                color="primary"
                outline
                className=" m-0 btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  setStatus({ value: 'paid', label: 'Paid' });
                }}
              >
                Details
              </Button>
            </CardFooter>
          </Card>
        </Col>
      </Row>
      <div className="datatable">
        <h4 className="mb-2">
          Bookings <Badge color="light-primary">{status.label}</Badge>
        </h4>

        <ReactDataGrid
          idProperty="_id"
          className="bookings-table text-small"
          style={gridStyle}
          columns={columns}
          filteredRowsCount={setFilteredRows}
          defaultFilterValue={defaultFilterValue}
          pagination
          livePagination
          dataSource={dataSource}
          onSortInfoChange={setSortInfo}
          onFilterValueChange={setFilterValue}
          showZebraRows={true}
          theme={skin === 'dark' ? 'amber-dark' : 'default-light'}
          cellSelection={cellSelection}
          onCellSelectionChange={setCellSelection}
          enableClipboard={true}
          onCopySelectedCellsChange={onCopySelectedCellsChange}
          onPasteSelectedCellsChange={onPasteSelectedCellsChange}
          expandedRows={expandedRows}
          collapsedRows={collapsedRows}
          onExpandedRowsChange={onExpandedRowsChange}
          rowExpandHeight={380}
          renderRowDetails={renderRowDetails}
        />
      </div>
    </div>
  );
};

export default DataGrid;

ReactDataGrid.defaultProps.filterTypes.string = {
  type: 'string',
  emptyValue: '',
  operators: [
    {
      name: 'contains',
      fn: {}
    }
  ]
};

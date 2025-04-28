import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { 
  format, 
  parse, 
  startOfWeek, 
  getDay, 
  isSameDay, 
  compareAsc, 
  addDays 
} from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import axios from "axios";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMeetings, setSelectedMeetings] = useState([]);
  const [view, setView] = useState(Views.MONTH);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const authRes = await axios.get('http://localhost:3000/checkauth', { 
          withCredentials: true 
        });
        const userId = authRes.data._id;
        const meetingRes = await axios.post('http://localhost:3000/allmeetings', { 
          user_id: userId 
        });
        
        const formattedEvents = meetingRes.data.meetings.map((meeting, index) => ({
          id: index,
          title: meeting.title,
          start: new Date(meeting.startTime),
          end: new Date(meeting.endTime),
          description: meeting.description
        }));

        setEvents(formattedEvents);
        updateMeetingsForDate(new Date());
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
      }
    }

    fetchMeetings();
  }, []);

  const updateMeetingsForDate = (date) => {
    const meetingsOnDate = events
      .filter(event => isSameDay(event.start, date))
      .sort((a, b) => compareAsc(a.start, b.start));
    setSelectedMeetings(meetingsOnDate);
  };

  const handleSelectSlot = (slotInfo) => {
    const clickedDate = slotInfo.start;
    setSelectedDate(clickedDate);
    updateMeetingsForDate(clickedDate);
    setView(Views.DAY);
  };

  const handleSelectEvent = (event) => {
    setSelectedDate(event.start);
    updateMeetingsForDate(event.start);
    setView(Views.DAY);
  };

  const handleNavigate = (newDate) => {
    setSelectedDate(newDate);
    updateMeetingsForDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
    if (newView === Views.DAY) {
      updateMeetingsForDate(selectedDate);
    }
  };

  const handlePrevious = () => {
    const newDate = addDays(selectedDate, -1);
    setSelectedDate(newDate);
    updateMeetingsForDate(newDate);
  };

  const handleNext = () => {
    const newDate = addDays(selectedDate, 1);
    setSelectedDate(newDate);
    updateMeetingsForDate(newDate);
  };

  const EventComponent = ({ event }) => (
    <div className="p-1">
      <strong>{event.title}</strong>
      {event.description && <div className="text-xs">{event.description}</div>}
    </div>
  );

  return (
    <div>
      <Navbar></Navbar>
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700" style={{color:"#1C2636"}}>
        Your Meetings
      </h2>

      {/* Date Navigation */}
      {view === Views.DAY && (
        <div className="flex justify-center items-center gap-4 mb-6">
          <button
            onClick={handlePrevious}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Previous
          </button>
          <h3 className="text-xl font-semibold">
            {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </h3>
          <button
            onClick={handleNext}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* View Switcher */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => handleViewChange(Views.MONTH)}
          className={`px-4 py-2 rounded ${
            view === Views.MONTH ? "bg-blue-600 text-white" : "bg-gray-300"
          }`}
        >
          Month
        </button>
        <button
          onClick={() => handleViewChange(Views.WEEK)}
          className={`px-4 py-2 rounded ${
            view === Views.WEEK ? "bg-blue-600 text-white" : "bg-gray-300"
          }`}
        >
          Week
        </button>
        <button
          onClick={() => handleViewChange(Views.DAY)}
          className={`px-4 py-2 rounded ${
            view === Views.DAY ? "bg-blue-600 text-white" : "bg-gray-300"
          }`}
        >
          Day
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable
          view={view}
          date={selectedDate}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          components={{
            event: EventComponent,
          }}
          eventPropGetter={() => ({
            style: {
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "4px",
              border: "none",
              padding: "2px 4px",
              fontSize: "14px",
            },
          })}
          dayLayoutAlgorithm="no-overlap"
        />
      </div>

      {/* Meetings on Selected Date */}
      {view !== Views.DAY && (
        <div className="mt-10 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-semibold mb-4 text-center">
            Meetings on {format(selectedDate, 'MMMM dd, yyyy')}
          </h3>

          {selectedMeetings.length === 0 ? (
            <p className="text-center text-gray-500">
              No meetings scheduled for this date.
            </p>
          ) : (
            <div className="space-y-4">
              {selectedMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                >
                  <p className="text-md text-gray-500 mb-1">
                    {format(meeting.start, 'h:mm a')} - {format(meeting.end, 'h:mm a')}
                  </p>
                  <h4 className="text-lg font-bold text-blue-600">
                    {meeting.title}
                  </h4>
                  {meeting.description && (
                    <p className="text-gray-600 text-sm mt-1">
                      {meeting.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
}
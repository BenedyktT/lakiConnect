import { GET_ROOM_SETUP, GET_CLEAN_ROOMS, LOAD_ROOMS } from "../actions/types";

const initialState = {
  roomsReport: [],
  loading: null
};

export default (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOAD_ROOMS:
      return { ...state, loading: true };
    case GET_ROOM_SETUP:
      const { cleanStatus, roomNote } = payload;
      const { currentRooms, nextRooms } = payload.roomStatus;

      //merge object from two requests (same key)
      const currentRoomSetup = currentRooms
        .map(occupancyRoom => {
          const { Room } = occupancyRoom;
          return Object.assign(
            ...cleanStatus.filter(el => el.Room === Room),
            occupancyRoom
          );
        })
        .filter((e, index, array) => {
          //If they are some duplicates - remove them - leaving the next index only
          if (array[index - 1]) {
            return e.Room !== array[index - 1].Room;
          } else return true;
        });

      //merge previous object with next day roomstatus report object
      const roomSetup = currentRoomSetup.map(currentRoom => {
        const { Room } = currentRoom;
        const nextRoomsArr = nextRooms.map(room => ({
          Room: room.Room,
          nextRooms: room.roomState
        }));
        return Object.assign(
          currentRoom,
          ...nextRoomsArr.filter(el => el.Room === Room)
        );
      });
      const noshow = "NO_SHOW";
      const co = "CHECKED_OUT";
      const na = "N_A";
      const avail = "AVAILABLE";
      const arr = "ARRIVED";
      const block = "BLOCKED";
      const narr = "NOT_ARRIVED";
      let roomsReport = roomSetup.map(
        ({ Room: number, Status: cleanStatus, roomState: c, nextRooms: n }) => {
          let vacancy;
          let roomStatus;

          if (cleanStatus === "C") {
            cleanStatus = "Clean";
          }
          if (cleanStatus === "U") {
            cleanStatus = "Not Clean";
          }

          if (
            (c === narr || c === avail || c === na || c === block) &&
            (n === narr || n === avail || n === na || n === co || n === block)
          ) {
            vacancy = cleanStatus;
            roomStatus = cleanStatus;
          }
          if (
            (c === narr || c === avail || c === block || c === na) &&
            n === arr
          ) {
            vacancy = "Occupied";
            roomStatus = "Arriving";
          }

          if (
            (c === block || c === na || c === avail || c === noshow) &&
            n === narr
          ) {
            vacancy = "Vacant";
            roomStatus = "Arriving";
          }
          if (c === co && n === narr) {
            vacancy = "Vacant";
            roomStatus = "Departure+Arriving";
          }
          if (c === arr && n === arr) {
            vacancy = "Stayover";
            roomStatus = "Stayover";
          }
          if (c === co && n === arr) {
            vacancy = "Vacant";
            roomStatus = "Departure+Arriving";
          }
          if (c === arr && n === narr) {
            vacancy = "Occupied";
            roomStatus = "Departure+Arriving";
          }
          if (
            (c === co || c === block || c === narr) &&
            (n === avail || n === co || n === na)
          ) {
            vacancy = "Vacant";
            roomStatus = "Departure";
          }
          if (c === arr && (n === block || n === na || n === avail)) {
            vacancy = "Occupied";
            roomStatus = "Departure";
          }

          if ((c === narr || c === avail || c === block) && n === block) {
            vacancy = "Out of Order";
            roomStatus = "Out of Order";
          }
          if (c === co && n === block) {
            vacancy = "Vacant";
            roomStatus = "Departure";
          }

          return {
            number,
            cleanStatus,
            vacancy,
            roomStatus
          };
        }
      );
      roomsReport = roomsReport.map(room => {
        const { number } = room;
        return Object.assign(
          ...roomNote.filter(el => {
            if (el.roomNote) {
              return el.number === number;
            } else {
              return null;
            }
          }),
          room
        );
      });

      return { ...state, roomsReport, loading: false };

    case GET_CLEAN_ROOMS:
      const newState = state.roomsReport.filter(e => {
        return payload.map(cleanRooms => {
          if (cleanRooms.number !== parseInt(e.number)) return null;
          e.cleanStatus = "Clean";
          e.cleanedBy = cleanRooms.username;
          return null;
        });
      });

      return { ...state, roomsReport: [...newState], loading: false };

    default:
      return state;
  }
};

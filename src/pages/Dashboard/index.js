import React, { useState, useMemo, useEffect } from 'react';
import {
  format,
  subDays,
  addDays,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isBefore,
  isEqual,
  parseISO,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import pt from 'date-fns/locale/pt';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { Container, Time } from './styles';
import api from '~/services/api';

const range = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export default function Dashboard() {
  const [date, setDate] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const dateFormatted = useMemo(
    () => format(date, "d 'de' MMMM", { locale: pt }),
    [date]
  );

  useEffect(() => {
    async function loadSchedule() {
      const res = await api.get('schedules', { params: { date } });

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const data = range.map(hour => {
        // Já gera a nova data no padrão UTC
        const checkDate = setMilliseconds(
          setSeconds(setMinutes(setHours(date, hour), 0), 0),
          0
        );

        const compareDate = utcToZonedTime(checkDate, timezone);

        return {
          time: `${hour}:00h`,
          past: isBefore(compareDate, new Date()),
          appointment: res.data.find(a => {
            // DEBUG CONSOLE
            console.tron.log(
              `New Date Web__: ${new Date()}`,
              `Timezone Web__: ${timezone}`,
              `CheckDate_____: ${checkDate}`,
              `API___________: ${a.date}`,
              `ParseISO______: ${parseISO(a.date)}`,
              `UTCtoZonedTime: ${compareDate}`,
              `RESERVADO_____: ${isEqual(parseISO(a.date), compareDate)}`
            );

            // VERIFICA SE O HORÁRIO JÁ ESTÁ EM USO.
            return isEqual(parseISO(a.date), compareDate);
          }),
        };
      });

      // console.tron.log(data);

      setSchedule(data);
    }

    loadSchedule();
  }, [date]);

  function handlePrevDay() {
    setDate(subDays(date, 1));
  }

  function handleNextDay() {
    setDate(addDays(date, 1));
  }

  return (
    <Container>
      <header>
        <button onClick={handlePrevDay} type="button">
          <MdChevronLeft size={36} color="#fff" />
        </button>
        <strong>{dateFormatted}</strong>
        <button onClick={handleNextDay} type="button">
          <MdChevronRight size={36} color="#fff" />
        </button>
      </header>

      <ul>
        {schedule.map(time => (
          <Time key={time.time} past={time.past} available={!time.appointment}>
            <strong>{time.time}</strong>
            <span>
              {time.appointment ? time.appointment.user.name : 'Em aberto'}
            </span>
          </Time>
        ))}
      </ul>
    </Container>
  );
}

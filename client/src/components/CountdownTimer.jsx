import React from 'react';
import DateTimeDisplay from '../utils/DateTimeDisplay';
import { useCountdown } from '../utils/useCountdown';

const ExpiredNotice2 = () => {
  return (
    <div className="expired-notice">
      <span>Expired!!!</span>
      <p>Please select a future date and time.</p>
    </div>
  );
};
const ExpiredNotice = ({title}) => {
  return (
    <div className="flex flex-col items-center w-[150px]">
      <h4 className="font-epilogue font-bold text-[20px] text-white p-3 bg-[#1c1c24] rounded-t-[10px] w-full text-center truncate">Expired</h4>
      <p className="font-epilogue font-normal text-[16px] text-[#808191] bg-[#28282e] px-3 py-2 w-full rouned-b-[10px] text-center">{title}</p>
    </div>
  );
};

const ShowCounter = ({ title, days, hours, minutes, seconds }) => {
  return (
        <div className="flex flex-col items-center w-[150px]">
          <h4 className="font-epilogue font-bold text-[20px] text-white p-3 bg-[#1c1c24] rounded-t-[10px] w-full text-center truncate">
              <DateTimeDisplay value={days} type={'Days'} isDanger={days <= 1} />
              <DateTimeDisplay value={hours} type={'Hours'} isDanger={false} />
              <DateTimeDisplay value={minutes} type={'Mins'} isDanger={false} />
              <DateTimeDisplay value={seconds} type={'Seconds'} isDanger={false} />
        </h4>
          <p className="font-epilogue font-normal text-[16px] text-[#808191] bg-[#28282e] px-3 py-2 w-full rouned-b-[10px] text-center">{title}</p>
        </div>
    )
};

const CountdownTimer = ({ title, targetDate }) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);

  if (days + hours + minutes + seconds <= 0) {
    return <ExpiredNotice title={"Finished"}/>;
  } else {
    return (
      <ShowCounter
        title={title}
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
      />
    );
  }
};

export default CountdownTimer;
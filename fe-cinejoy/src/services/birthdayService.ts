import { addBirthdayPointsApi } from './api';
import dayjs from 'dayjs';

interface BirthdayPointsResult {
  isBirthday: boolean;
  pointsAdded: number;
  message: string;
}

export const checkBirthday = (userDateOfBirth: string): boolean => {
  if (!userDateOfBirth) return false;
  
  const today = dayjs();
  const birthday = dayjs(userDateOfBirth);
  
  return today.format('MM-DD') === birthday.format('MM-DD');
};

export const handleBirthdayPoints = async (userId: string, userDateOfBirth: string): Promise<BirthdayPointsResult> => {
  try {
    if (!checkBirthday(userDateOfBirth)) {
      return {
        isBirthday: false,
        pointsAdded: 0,
        message: 'Hôm nay không phải là ngày sinh nhật của bạn'
      };
    }

    const lastBirthdayCheck = localStorage.getItem(`birthday_points_${userId}_${dayjs().format('YYYY-MM-DD')}`);
    if (lastBirthdayCheck) {
      return {
        isBirthday: true,
        pointsAdded: 0,
        message: 'Bạn đã nhận điểm sinh nhật hôm nay rồi! 🎉'
      };
    }

    const updateResult = await addBirthdayPointsApi(userId, 100);

    if (updateResult?.status && updateResult?.data) {
      localStorage.setItem(`birthday_points_${userId}_${dayjs().format('YYYY-MM-DD')}`, 'true');
      
      return {
        isBirthday: true,
        pointsAdded: updateResult.data.pointsAdded,
        message: `🎉 Chúc mừng sinh nhật! Bạn đã nhận được ${updateResult.data.pointsAdded} điểm CNJ!`
      };
    } else {
      return {
        isBirthday: true,
        pointsAdded: 0,
        message: 'Có lỗi xảy ra khi cộng điểm sinh nhật. Vui lòng thử lại!'
      };
    }
  } catch (error) {
    console.error('Error handling birthday points:', error);
    return {
      isBirthday: false,
      pointsAdded: 0,
      message: 'Có lỗi xảy ra khi xử lý điểm sinh nhật!'
    };
  }
};

export const getBirthdayInfo = (userDateOfBirth: string) => {
  if (!userDateOfBirth) return null;
  
  const birthday = dayjs(userDateOfBirth);
  const today = dayjs().startOf('day');
  let nextBirthday = birthday.year(today.year()).startOf('day');
  
  if (nextBirthday.isBefore(today, 'day')) {
    nextBirthday = nextBirthday.add(1, 'year');
  }
  
  const daysUntilBirthday = nextBirthday.diff(today, 'day');
  const isToday = daysUntilBirthday === 0;
  
  return {
    birthdayDate: birthday.format('DD/MM'),
    nextBirthday: nextBirthday.format('DD/MM/YYYY'),
    daysUntilBirthday: isToday ? 0 : daysUntilBirthday,
    isToday
  };
};

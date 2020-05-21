function selected(option, value) {
  return isSelected(option, value) ? 'selected' : '';
}

function checked(option, value) {
  return isSelected(option, value) ? 'checked' : '';
}

function isSelected(option, value) {
  return option && value && option.toString() === value.toString();
}

function formatDate(dateTime) {
  //console.log('the event date is ', date);
  const time = dateTime.toString().slice(16, 21);
  const date = dateTime.toString().slice(0, 15);
  return date + ' at ' + time;
}

function restrictList(array, limit) {
  return array.slice(0, limit);
}

module.exports = {selected, checked, formatDate, restrictList};


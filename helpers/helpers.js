function selected(option, value) {
  return isSelected(option, value) ? 'selected' : '';
}

function checked(option, value) {
  return isSelected(option, value) ? 'checked' : '';
}

function isSelected(option, value) {
  return option && value && option.toString() === value.toString();
}

module.exports = {selected, checked};


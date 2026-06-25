const myRatingCustomIcons2 = document.getElementById('myRatingCustomIcons2')

const optionsCustomIcons2 = {
  activeIcon: '<i class="cil-heart text-danger"></i>',
  icon: '<i class="cil-heart"></i>',
  value: 3
}
new coreui.Rating(myRatingCustomIcons2, optionsCustomIcons2)

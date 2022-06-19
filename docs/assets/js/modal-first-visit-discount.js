// Get Cookie

const getCookie = cname => {
  const name = `${cname}=`
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for(let i = 0; i <ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return '';
}

// Set Cookie
const setCookie = (cname, cvalue, exdays) => {
  const d = new Date()
  d.setTime(d.getTime() + (exdays*24*60*60*1000))
  var expires = 'expires='+ d.toUTCString()
  document.cookie = `${cname}=${cvalue};${expires};path=/`
}

const checkIfFirstVisit = () => {
  const modalContainerEl = document.createElement('div')
  modalContainerEl.innerHTML =
  `
  <div class="modal fade" id="modal-first-visit" tabindex="-1" role="dialog" aria-label="Downloads" aria-hidden="true">
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
        <div class="modal-header d-block">
          <button type="button" class="btn-close float-end" data-coreui-dismiss="modal" aria-label="Close"></button>
          <div class="text-center modal-title">
            <h2>Buy CoreUI PRO now and save 75%</h2>
            <h3 class="text-danger">This is one-time offer!</h3>
          </div>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-7 d-flex align-items-center">
              <div>
                <img src="https://coreui.io/images/mockups/mockup_3_1_free.webp" class="img-fluid" alt="Bootstrap Admin Panel Template" loading="lazy">
              </div>
            </div>
            <div class="col-md-5">
              <p>Get a PRO plan to access advanced features, professional support, and support CoreUI development.</p>
              <ul class="list-unstyled">
                <li class="py-2">✅ Save thousands of dollars for UI and UX designing.</li>
                <li class="py-2">✅ Human tech support provided by CoreUI Core Team Developers.</li>
                <li class="py-2">✅ PRO Components: Date Picker, Multi Select, Smart Table, etc.</li>
              </ul>
              <h3 class="text-danger text-center mb-3">Use code CDITFDSF at checkout.</h3>
              <a href="https://coreui.io/pricing/" class="btn btn-lg btn-success" style="width: 100%;">
                Buy now and save up to $749
              </a>
            </div>
          </div>
        </div>
        <div class="modal-footer">
        <div class="text-center">
        <div class="text-uppercase mb-3 row">
        <div class="col-md-9 mx-auto">
        <strong>You’re in good company. <span class="text-muted">CoreUI powers thousands of apps at some of the smartest companies around the world.</span></strong>
        </div>
        </div>
        <div class="row">
        <div class="col">
        <img class="img-fluid" src="https://coreui.io/images/clients/nvidia600.png" alt="Nvidia">
        </div>
        <div class="col">
        <img class="img-fluid" src="https://coreui.io/images/clients/ea600.png" alt="EA">
        </div>
        <div class="col">
        <img class="img-fluid" src="https://coreui.io/images/clients/dhl600.png" alt="DHL">
        </div>
        <div class="col">
        <img class="img-fluid" src="https://coreui.io/images/clients/olx600.png" alt="OLX">
        </div>
        <div class="col">
        <img class="img-fluid" src="https://coreui.io/images/clients/citi600.png" alt="Citi">
        </div>
        <div class="col">
        <img class="img-fluid" src="https://coreui.io/images/clients/paypal600.png" alt="PayPal">
        </div>
        <div class="col">
        <img class="img-fluid" src="https://coreui.io/images/clients/virgin-media600.png" alt="Virgin">
        </div>
        <div class="col">
        <img class="img-fluid" src="https://coreui.io/images/clients/plus500600.png" alt="Plus500">
        </div>
        <div class="col">
        <img class="img-fluid" src="https://coreui.io/images/clients/cisco600.png" alt="Cisco">
        </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  </div>
  `
  document.body.appendChild(modalContainerEl);

  setTimeout(() => {
    const myModalEl = new coreui.Modal(document.getElementById('modal-first-visit'))
    myModalEl.toggle()
    setCookie('firstVisit', true, 365)
  }, 2500)
}

window.onload = function() {
  if (getCookie('firstVisit') !== 'true') {
    checkIfFirstVisit()
  }
};

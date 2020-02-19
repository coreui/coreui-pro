import './../dist/css/coreui.css'

export default {
  title: 'Breadcrumb'
}

export const All = () => `
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item active" aria-current="page">Home</li>
  </ol>
</nav>

<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">CoreUI</a></li>
    <li class="breadcrumb-item active" aria-current="page">Library</li>
  </ol>
</nav>

<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">CoreUI</a></li>
    <li class="breadcrumb-item"><a href="#">Profile</a></li>
    <li class="breadcrumb-item active" aria-current="page">Data</li>
  </ol>
</nav>

<hr>

<nav class="breadcrumb">
  <a class="breadcrumb-item" href="#">CoreUI</a>
  <a class="breadcrumb-item" href="#">Profile</a>
  <a class="breadcrumb-item" href="#">Data</a>
  <span class="breadcrumb-item active">Details</span>
</nav>

<hr>

<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item active">Home</li>
    <!-- Breadcrumb Menu-->
    <li class="breadcrumb-menu">
      <div class="btn-group" role="group" aria-label="Button group with nested dropdown">
        <a class="btn" href="#"><i class="cil-speech"></i></a>
        <a class="btn" href="#"><i class="cil-graph mr-2"></i> Dashboard</a>
        <a class="btn" href="#"><i class="cil-settings mr-2"></i> Settings</a>
      </div>
    </li>
  </ol>
</nav>
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item active">Library</li>
    <!-- Breadcrumb Menu-->
    <li class="breadcrumb-menu">
      <div class="btn-group" role="group" aria-label="Button group with nested dropdown">
        <a class="btn" href="#"><i class="cil-speech"></i></a>
        <a class="btn" href="#"><i class="cil-graph mr-2"></i> Dashboard</a>
        <a class="btn" href="#"><i class="cil-settings mr-2"></i> Settings</a>
      </div>
    </li>
  </ol>
</nav>
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item"><a href="#">Library</a></li>
    <li class="breadcrumb-item active">Data</li>
    <!-- Breadcrumb Menu-->
    <li class="breadcrumb-menu">
      <div class="btn-group" role="group" aria-label="Button group with nested dropdown">
        <a class="btn" href="#"><i class="cil-speech"></i></a>
        <a class="btn" href="#"><i class="cil-graph mr-2"></i> Dashboard</a>
        <a class="btn" href="#"><i class="cil-settings mr-2"></i> Settings</a>
      </div>
    </li>
  </ol>
</nav>

<hr>

<nav class="breadcrumb">
  <a class="breadcrumb-item" href="#">Home</a>
  <a class="breadcrumb-item" href="#">Library</a>
  <a class="breadcrumb-item" href="#">Data</a>
  <span class="breadcrumb-item active">Bootstrap</span>
  <!-- Breadcrumb Menu-->
  <div class="breadcrumb-menu">
    <div class="btn-group" role="group" aria-label="Button group with nested dropdown">
      <a class="btn" href="#"><i class="cil-speech"></i></a>
      <a class="btn" href="#"><i class="cil-graph mr-2"></i> Dashboard</a>
      <a class="btn" href="#"><i class="cil-settings mr-2"></i> Settings</a>
    </div>
  </div>
</nav>
`

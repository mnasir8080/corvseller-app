<!-- src/components/Till.vue -->
<template>
  <div id="openingBalanceModal" v-if="showopeningBalanceModal" class="modal fade show" tabindex="-1" role="dialog" aria-labelledby="paymentModalLabel" style="display: block; background: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title mt-0">Enter Opening Balance</h5>
        </div>
        <div align="center" class="modal-body" style="overflow-y:auto; max-height:65vh;">
          <div class="row">
            <div class="col-12">
              <input 
                @keyup.enter="saveOpeningBalance"
                v-model.trim="openingBalance"
                placeholder="Opening Balance" 
                @focus="clearInput('openBalance')"
                />
            </div>
          </div>
          <hr/>
          <div class="row">
            <div class="col-4">
              <button 
                @click="handleLogout" 
                type="button" 
                class="btn btn-danger btn-block" 
                ><i style="font-size:18px;"></i> &nbsp;Logout
              </button>
            </div>
            <div class="col-4">
              <button 
                @click="handleSync('syncNow')" 
                type="button" 
                class="btn btn-primary btn-block" 
                ><i class="" style="font-size:18px;"></i> &nbsp;&nbsp;Sync Till
              </button>
            </div>
            <div class="col-4">
              <button 
                @click="saveOpeningBalance" 
                type="button" 
                class="btn btn-success btn-block" 
                ><i class="" style="font-size:18px;"></i> &nbsp;&nbsp;Open Till
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer"></div>
      </div>
    </div>
  </div> 
  <div id="closingBalanceModal" v-if="showclosingBalanceModal" class="modal fade show" tabindex="-1" role="dialog" aria-labelledby="paymentModalLabel" style="display: block; background: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title mt-0">Confirm And Post Tender </h6>
          <button type="button" class="close btn btn-danger" @click="closeclosingBalanceModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div align="center" class="modal-body">
          <div class="row" style="margin-bottom: 3px">
            <div class="col-4"><span class='discountStyle'>CASH:</span></div>
            <div class="col-8">
              <input 
                v-model.trim="CashClosed"
                placeholder="Total CASH Counted" 
                @focus="clearInput('CashClosed')"
                />
            </div>
          </div>
          <div class="row" style="margin-bottom: 3px">
            <div class="col-4"><span class='discountStyle'>POS:</span></div>
            <div class="col-8">
              <input 
                v-model.trim="POSClosed"
                placeholder="Total POS Confirmed" 
                @focus="clearInput('POSClosed')"
                />
            </div>
          </div>
          <div class="row" style="margin-bottom: 3px">
            <div class="col-4"><span class='discountStyle'>TRANSFER:</span></div>
            <div class="col-8">
              <input 
                v-model.trim="TransferClosed"
                placeholder="Total Transfers Confirmed" 
                @focus="clearInput('TransferClosed')"
                />
            </div>
          </div>
          <div class="row" style="margin-bottom: 3px">
            <div class="col-4"><span class='discountStyle'>PETTY CASH Spent:</span></div>
            <div class="col-8">
              <input 
                v-model.trim="PettyExpClosed"
                placeholder="Petty Cash Spent" 
                @focus="clearInput('PettyExpClosed')"
                />
            </div>
          </div>
          <div class="row">
            <div class="col-4"><span class='discountStyle'>PETTY CASH DESC:</span></div>
            <div class="col-8">
                <textarea v-model.trim="ExpDescClosed"
                placeholder="Petty Cash Description" 
                @focus="clearInput('ExpDescClosed')"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button 
          @click="saveClosingBalance" 
          type="button" 
          class="btn btn-success btn-block" 
          style="width:100%;"><i class="" style="font-size:18px;"></i> &nbsp;&nbsp;Send
          </button>
        </div>
      </div>
    </div>
  </div> 
<!-- Payment Modal -->
  <div id="paymentModal" v-if="showPaymentModal" class="modal fade show" tabindex="-1" role="dialog" aria-labelledby="paymentModalLabel" style="display: block; background: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="paymentModalLabel">Payment</h5>
          <button type="button" class="close btn btn-danger" @click="closePaymentModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <!-- <div class="overlay" v-if="processingPayment">
            <div class="loader"></div>
          </div> -->
          <ul id="paymentNav">
            <li class="method cash" :class="{ active: cashActive }"  @click="PayView('cash')">Instant<div align="center" class="amt"><span class="amtCash"> {{ngnFormatter.format(totalRcv)}}</span></div>
              <div align="center" class="content">
                <div class="row">
                  <div class="col-8">
                    <input value="Cash" disabled/>
                    <div class="label"><i class="mdi mdi-currency-ngn"></i>Cash</div>
                  </div>
                  <div class="col-4">
                    <input v-model.trim.number="cashRcv" :disabled="isCustomer"  
                     autocomplete="off" @focus="clearInput('cash')" @blur="inputBlur('cash')"/>
                    <div class="label"><i class="mdi mdi-currency-ngn"></i> Cash Received</div>
                  </div>
                </div>
                <hr />
                <div class="row">
                  <div class="col-5">
                    <select v-model="posBank" :disabled="isCustomer"
                    style="border:1px solid #DDD; width:100%; height:35px; margin-top:10px; text-align:center;">
                      <option value="">- Select POS Bank -</option>
                      <template v-if="store.POSBanks !== null">
                        <option v-for="pos in store.POSBanks" :value="pos.id">{{pos.name}}</option>
                      </template>
                    </select>
                    <div class="label">POS Bank</div>
                  </div>
                  <div class="col-3">
                    <input v-model.trim="posDesc" :disabled="posBank==''"
                    autocomplete="off" />
                    <div class="label">Stan No</div>
                  </div>
                  <div class="col-4">
                    <input v-model.trim="posRcv" :disabled="posBank==''"
                    autocomplete="off" @focus="clearInput('pos')" @blur="inputBlur('pos')"/>
                    <div class="label"><i class="mdi mdi-currency-ngn"></i> POS Received</div>
                  </div>
                </div>
                <hr/>
                <div class="row">
                    <div class="col-5">
                      <select v-model="transferBank" :disabled="isCustomer"
                      style="border:1px solid #DDD; width:100%; height:35px; margin-top:10px; text-align:center;">
                        <option value="">- Select Transfer Bank -</option>
                        <template v-if="store.TransferBanks !== null">
                          <option v-for="transfer in store.TransferBanks" :value="transfer.id">{{transfer.name}} | {{transfer.number}} ({{transfer.bank}})</option>
                        </template>
                      </select>
                      <div class="label">Transfer Bank</div>
                    </div>
                    <div class="col-3">
                      <input v-model.trim="transferDesc" type="text" 
                      autocomplete="off" :disabled="transferBank==''" />
                      <div class="label">Description</div>
                    </div>
                    <div class="col-4">
                      <input v-model.trim="transferRcv"  autocomplete="off" @focus="clearInput('transfer')" 
                      @blur="inputBlur('transfer')" :disabled="transferBank==''"/>
                      <div class="label"><i class="mdi mdi-currency-ngn"></i> Transfer Received</div>
                    </div>
                  </div>
                  </hr>
              </div>
            </li>
            <li class="method credit" :class="{ active: creditActive }" @click="PayView('credit')">Credit<div align="center" class="amt"><span class="amtCredit"> {{ngnFormatter.format(creditRcv)}}</span></div>
              <div align="center" class="content">
              <select v-model="selectedCustomer" @change="whichCustomer" style="border:1px solid #DDD; width:100%; height:35px; margin-top:10px; text-align:center;">
                <option value="0">- Select Customer -</option>
                <template v-if="customersLoaded !== null">
                  <option v-for="customer in customersLoaded" :value="customer.id" :key="customer.id" style="text-transform: uppercase;">{{customer.phone}} | {{customer.name}}</option>
                </template>
              </select>
              <div class="label">Customer</div>
                <div class="row">
                  <div class="col-4">Credit Limit</div>
                  <div class="col-8">
                    <input v-model.trim.number="cusLimit" autocomplete="off" disabled/>
                  </div>
                </div>
                <div class="row">
                  <div class="col-4">Account Balance</div>
                  <div class="col-8">
                    <input  v-model.trim.number="cusBalance" autocomplete="off" disabled/>
                  </div>
                </div>
                <div class="row">
                  <div class="col-4">Current Charges</div>
                  <div class="col-8">
                    <input v-model.trim.number="totalDue" autocomplete="off" disabled/>
                  </div>
                </div>
                <br/>
                <div class="row">
                  <div class="col-12">
                    <textarea v-model.trim="cusDesc" :disabled="!isCustomer" style="height: 60px;"
                    autocomplete="off" placeholder="Description"></textarea></div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div align="right" class="modal-footer">
          <ul id="details">
            <li>
              <input v-model="totalDue" type="text" readonly />
              <div class="label">Total Due (<i class="mdi mdi-currency-ngn"></i>)</div>
            </li>
            <li>
              <input v-model.trim.number="discount" type="text" />
              <div class="label">Discount (<i class="mdi mdi-currency-ngn"></i>)</div>
            </li>
          </ul>
          <ul id="details">
            <li>
              <input type="text" :value="totalRcv" readonly />
              <div class="label">Total Received (<i class="mdi mdi-currency-ngn"></i>)</div>
            </li>
            <li>
              <input :value="totalChange" readonly />
              <div class="label">Change (<i class="mdi mdi-currency-ngn"></i>)</div>
            </li>
          </ul>
          <div class="row" style="width: 100%">
            <div class="col-6">
              <!-- <button @click="processInvoice" class="btn btn-block btn-primary" style="width: 100%">Hold</button> -->
              <button @click="holdInvoice" class="btn btn-info" style="width: 100%">
                  <i class="material-icons">archive</i> Hold
                </button>

            </div>
            <div class="col-6">
              <button @click="processPayment" style="width: 100%"
              :disabled="(!toBeProcessed && !isCustomer) || (isCustomer && maxLimit)" 
                class="btn btn-block" 
                :class="{
                  'btn-success': ((toBeProcessed && !isCustomer) || (isCustomer && !maxLimit)) ,
                  'btn-danger': ((!toBeProcessed && !isCustomer) || (isCustomer && maxLimit))
                  }">
                  Process
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div id="depositModal" v-if="showDepositModal" class="modal fade show" tabindex="-1" role="dialog" aria-labelledby="paymentModalLabel" style="display: block; background: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title mt-0">Process Customer's Deposit</h6>
          <button type="button" class="close btn btn-danger" @click="closedepositModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <ul id="paymentNav">
            <li class="method cash active">Deposit
              <div align="center" class="content">
                <div class="row">
                  <div class="col-12">
                    <div class="label">Select Customer</div>
                    <select v-model="depositCusID"  @change="depositWhichCustomer"
                    style="border:1px solid #DDD; width:100%; height:35px; margin-top:10px; text-align:center;">
                      <option value="">- Select Customer -</option>
                      <template v-if="customersLoaded !== null">
                        <option v-for="customer in customersLoaded" :value="customer.id" :key="customer.id" style="text-transform: uppercase;">{{customer.phone}} | {{customer.name}}</option>
                      </template>
                    </select>
                  </div>
                </div>
                <hr/>
                <input v-model.trim="depositCashRcv"  autocomplete="off" 
                :disabled="depositCusID == ''" @focus="clearInput('cash')"/>
                <div class="label"><i class="mdi mdi-currency-ngn"></i> Cash Received</div>
                <hr/>
                <div class="row">
                  <div class="col-6">
                    <select v-model="depositPosBank" :disabled="depositCusID == ''"
                    style="border:1px solid #DDD; width:100%; height:35px; margin-top:10px; text-align:center;">
                      <option value="">- Select POS Bank -</option>
                      <template v-if="store.POSBanks !== null">
                        <option v-for="pos in store.POSBanks" :value="pos.id">{{pos.name}}</option>
                      </template>
                    </select>
                    <div class="label">POS Bank</div>
                  </div>
                  <div class="col-3">
                    <input v-model.trim="depositPosDesc" :disabled="depositPosBank==''"
                    autocomplete="off" />
                    <div class="label">Stan No</div>
                  </div>
                  <div class="col-3">
                    <input v-model.trim="depositPosRcv" :disabled="depositPosBank==''"
                    autocomplete="off" @focus="clearInput('pos')"/>
                    <div class="label"><i class="mdi mdi-currency-ngn"></i> POS Received</div>
                  </div>
                </div>
                <hr/>
                
                <div class="row">
                  <div class="col-6">
                    <select v-model="depositTransferBank" :disabled="depositCusID == ''"
                    style="border:1px solid #DDD; width:100%; height:35px; margin-top:10px; text-align:center;">
                      <option value="">- Select Transfer Bank -</option>
                      <template v-if="store.TransferBanks !== null">
                        <option v-for="transfer in store.TransferBanks" :value="transfer.id">{{transfer.name}} | {{transfer.number}} ({{transfer.bank}})</option>
                      </template>
                    </select>
                    <div class="label">Transfer Bank</div>
                  </div>
                  <div class="col-3">
                    <input v-model.trim="depositTransferDesc" type="text" 
                    autocomplete="off" :disabled="depositTransferBank==''" />
                    <div class="label">Description</div>
                  </div>
                  <div class="col-3">
                    <input v-model.trim="depositTransferRcv"  autocomplete="off" 
                    @focus="clearInput('transfer')" :disabled="depositTransferBank==''"/>
                    <div class="label"><i class="mdi mdi-currency-ngn"></i> Transfer Received</div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div align="right" class="modal-footer">
          <ul id="details">
            <li>
              <input type="text" :value="ngnFormatter.format(depositCusBalance)" readonly />
              <div class="label">Current Balance (<i class="mdi mdi-currency-ngn"></i>)</div>
            </li>
            <li>
              <input type="text" :value="ngnFormatter.format(depositTotalRcv)" readonly />
              <div class="label">Total Received (<i class="mdi mdi-currency-ngn"></i>)</div>
            </li>
            <li>
              <input type="text" :value="ngnFormatter.format(depositTotalRcv+depositCusBalance)" readonly />
              <div class="label">New Balance (<i class="mdi mdi-currency-ngn"></i>)</div>
            </li>
          </ul>
          <button @click="deposit" :disabled="depositTotalRcv < 1" class="btn btn-block btn-success" style="width: 100%">
            Process
          </button>
        </div>
      </div>
    </div>
  </div>
  <div id="passwordModal" v-if="showpasswordModal" class="modal fade show" tabindex="-1" role="dialog" aria-labelledby="paymentModalLabel" style="display: block; background: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title mt-0">Update Your Password </h6>
          <button type="button" class="close btn btn-danger" @click="closepasswordModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div align="center" class="modal-body">
          <div class="row" style="margin-bottom: 5px">
            <div class="col-4"><span class='discountStyle'>Current Password:</span></div>
            <div class="col-8">
              <input 
                v-model.trim="current_password"
                type="password"
                placeholder="Current Password" 
                @focus="clearInput('current_password')"
                />
            </div>
          </div>
          <div class="row" style="margin-bottom: 5px">
            <div class="col-4"><span class='discountStyle'>New Password:</span></div>
            <div class="col-8">
              <input 
                v-model.trim="new_password"
                type="password"
                placeholder="New Password" 
                @focus="clearInput('new_password')"
                />
            </div>
          </div>
          <div class="row" style="margin-bottom: 5px">
            <div class="col-4"><span class='discountStyle'>Confirm Password:</span></div>
            <div class="col-8">
              <input 
                v-model.trim="confirm_password"
                type="password"
                placeholder="Confirm Password" 
                @focus="clearInput('confirm_password')"
                />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button 
          @click="updatePassword" 
          type="button" 
          class="btn btn-success btn-block" 
          style="width:100%;"><i class="" style="font-size:18px;"></i> &nbsp;&nbsp;Update
          </button>
        </div>
      </div>
    </div>
  </div> 
  <template>
  <!-- Add this to your template -->
  <div class="scanner-container" v-if="isScanning">
    <video ref="videoElement" class="scanner-video"></video>
    <div class="scanner-overlay">
      <div class="scanner-line"></div>
    </div>
    <button @click="stopScanning" class="stop-button">Stop Scanning</button>
  </div>
</template>
  <div class="till-container">
    <div class="row h-100">
      <!-- Left Column -->
      <div class="col-md-4 h-100 d-flex flex-column">
        <div class="card mb-3 flex-shrink-0">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">SALES POINT</h5>
            <!-- <img src="/src/assets/cusPay.png" style="width: 40px; height: 40px;"/> -->
          </div>
          <div class="card-body position-relative">
            <!-- Cashier Information -->
            <div class="d-flex align-items-center mb-3">
              <img :src="getUserAvatar(user)" :alt="user.name" class="rounded-circle me-2" style="width: 50px; height: 50px; object-fit: cover;">
            <div>
                <h6 class="mb-0">{{ user.name }}</h6>
                <!-- <small class="text-muted">Till ID: {{ till.code }}</small> -->
              </div>
            </div>
            <!-- Product Search -->
            <div class="input-group mb-3">
              <input v-model="needle" @input="handleSearch" id="productInput" class="form-control" placeholder="Search Products, Bar-Code Or Invoice Code">
              <button @click="openPaymentModal" class="btn btn-outline-secondary">
                  <i class="material-icons">barcode_reader</i> 
                </button>
            </div>
            <!-- Scanner Modal -->
            <div v-if="isScanning" class="scanner-modal">
              <div class="scanner-container">
                <button class="scanner-close" @click="stopScanning">×</button>
                <video 
                  ref="videoElement" 
                  class="scanner-video"
                  playsinline
                  muted
                ></video>
                <div class="scanner-overlay">
                  <div class="scanner-focus-area"></div>
                  <div class="scanner-line"></div>
                  <div class="scanner-target"></div>
                </div>
                <div v-if="isLoading" class="scanner-loading">
                  Initializing camera...
                </div>
                <div class="scanner-status" :class="{ 'error': hasError }">
                  {{ scannerStatus }}
                </div>
              </div>
            </div>
            <!-- Search Results -->
            <div v-if="searchResults.length > 0" class="search-results-overlay">
              <div v-for="product in searchResults" :key="product.SID" @click="addToCart(product)" class="search-result-item">
                {{ product.brand }} {{ product.description }} <br/>
                {{ ngnFormatter.format(product.discounted) }} / {{ product.stockIn }}
              </div>
            </div>
          </div>
        </div> 
        <div class="card flex-grow-1 d-flex flex-column" style="height:auto;">    
          <div class="card-header">
            <h5 class="mb-0">INVOICE HOLD
              <MaterialIcon name="clear_all" :size="35"  color="#EA3323" title="Clear All" 
               style="float: right;" @click="clearHold()"/>
            </h5>
          </div>
          <div class="card-body flex-grow-1" style="height: calc(100vh - 385px); min-height: 100px; overflow-y: auto;">
            <div class="mb-2 p-2 border rounded" v-for="(pen,i) in invoicesHold" @click="handleInvoiceHeld(pen.invID)"  style="cursor: pointer;">
                <div class="body">
                  <div class="name">{{pen.userD}}</div>
                  <div class="row">
                    <div class="col-sm-4">
                      <span class="invoiceCode">{{ngnFormatter.format(pen.totalDue)}}</span>
                    </div>
                    <div class="col-sm-8">
                      <span class="date">{{pen.invTimeStamp}} 
                      </span>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Column -->
      <div class="col-md-8 h-100 d-flex flex-column">
        <div class="card flex-grow-1 d-flex flex-column">
          <div class="card card-sec m-b-10" style="height:auto;">
            <div class="card-body">
              <div class="header-title">
                <h4>Sales Details</h4>
                <span>
                  <MaterialIcon 
                  v-if = "onlineStatusStore.online"
                    name="cloud_sync" 
                    :size="40" 
                    color="#8C1AF6" 
                    title="Menu" 
                    @click="handleSync('syncNow')" 
                  />
                  <MaterialIcon 
                  v-else
                    name="sync_disabled" 
                    :size="40" 
                    color="#F00" 
                    title="Menu" 
                  />
                </span>
                <CustomDropdown 
                  icon-name="menu_open"
                  size="40" 
                  icon-color="#8C1AF6"
                  header-title="Menu"
                  title="Menu Options"
                >
                  <a href="#" class="dropdown-item" @click="depositModal">
                    <MaterialIcon name="receipt" :size="24"  icon-color="#8C1AF6"/>
                    <span>Customer Deposit</span>
                  </a>
                  <a href="#" class="dropdown-item" @click="passwordModal">
                    <MaterialIcon name="person" :size="24" />
                    <span>Change Password</span>
                  </a> 
                  <div class="dropdown-divider"></div>
                  <a href="#" class="dropdown-item" @click="closingBalanceModal">
                    <MaterialIcon name="close" :size="24"  icon-color="red"/>
                    <span>Close Shift</span>
                  </a>
                </CustomDropdown>
              </div>
              <div class="rtl-tbl">
                <div class="cart-list">
                  <div class="cart-item">
                    <ul class="sales-tab header">
                      <li class="sno">SN</li>
                      <li class="product">Product</li>
                      <li class="qty">Quantity</li>
                      <li class="sub">Sub-Total</li>
                      <li class="remove"><i class="material-icons">delete</i></li>
                    </ul>
                  </div>
                </div>
                <div class="cart-list main" id="cartList">
                  <div class="cart-item" v-for="(item, index) in cart" :key="index">
                    <ul class="sales-tab body">
                      <li class="sno"><span class="sno">{{ index + 1 }}</span></li>
                      <li class="product">
                        <span class="brand"> brand{{ item.brand }}</span>
                        <div>{{ item.description }}</div>
                      </li>
                      <li class="qty">
                        <div class="input-group bootstrap-touchspin">
                          <span class="input-group-btn"><button @click="decreaseQuantity(index,1)" class="btn btn-primary bootstrap-touchspin-down btnRoundL" type="button">-</button></span>
                          <input v-model.number="item.qty" @keyup="qtyKeyUp(index,$event.target.value)"
                          class="form-control qty"  pattern="^[0-9]+$" :min="1" style="display: block;" />
                          <span class="input-group-btn"><button @click="increaseQuantity(index,1)" class="btn btn-primary bootstrap-touchspin-up btnRoundR" type="button">+</button></span>
                        </div>
                      </li>
                      <li class="sub"><span class="sub-total">{{ ngnFormatter.format(item.Sub) }}</span></li>
                      <li class="remove" @click="deleteItem(index)">
                        <i class="material-icons" style="font-size: 25px; color: red;">delete</i>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="cart-list">
                  <div class="cart-item">
                    <ul class="sales-tab total" style="font-weight:bold;">
                      <li class="sno">&nbsp;</li>
                      <li class="product">Total</li>
                      <li class="qty">&nbsp;</li>
                      <li class="sub"> <span id="total">{{ ngnFormatter.format(total) }}</span></li>
                      <li class="remove">&nbsp;</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-between mt-3">
                <button @click="cartClear" class="btn btn-danger flex-grow-1 me-2">
                  <i class="material-icons">delete</i> Empty
                </button>
                <button @click="holdInvoice" class="btn btn-info flex-grow-1 me-2">
                  <i class="material-icons">archive</i> Hold
                </button>
                <button @click="openPaymentModal" class="btn btn-success flex-grow-1">
                  <i class="material-icons">payment</i> Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div> 
</template>

<script>
  import { ref, computed, onBeforeMount, onMounted, onUnmounted, watch } from 'vue';
  import axios from 'axios'
  import alertify from 'alertifyjs';
  import { useAuthStore } from '../stores/auth'
  import { useOnlineStatusStore } from '../stores/online-status'
  import { useLoaderStore } from '../stores/loader'
  import { useOfflineSyncStore } from '../stores/offlineSyncStore';
  import localForage from 'localforage';
  import { cloneDeep } from 'lodash';
  import Swal from 'sweetalert2';
  import MaterialIcon from './MaterialIcon.vue'
  import CustomDropdown from './CustomDropdown.vue'
  import { config, getApiUrl } from '@/config';
  import { 
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  MultiFormatReader
} from '@zxing/library';
  
  export default {
    name: 'Till',
    components: {
      CustomDropdown,
      MaterialIcon // Add this
    },
    setup() {
      const authStore = useAuthStore()
      const onlineStatusStore = useOnlineStatusStore()
      const loaderStore = useLoaderStore()
      const ngnFormatter = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      })
      const needle = ref('');
      const searchResults = ref([]);
      const cart = ref([]);
      const user = computed(() => authStore.getUser)
      const tillD = computed(() => authStore.getTillD)
      const store = computed(() => authStore.getStoreD)
      const till = tillD.value.tillD
      const offlineInvoicesCount = ref(0)
      const showPaymentModal = ref(false); 
      // const processingPayment = ref(false)
      const cashRcv = ref(0.00);
      const posRcv = ref(0.00);
      const posBank = ref('');
      const posDesc = ref('');
      const transferRcv = ref(0.00);
      const transferBank = ref('')
      const transferDesc = ref('')
      const creditRcv = ref(0.00);
      const isCustomer = ref(false)
      const maxLimit = ref(false)
      const selectedCustomer = ref(0);
      const cusLimit = ref(parseFloat(0.00));
      const cusBalance = ref(parseFloat(0.00));
      const cusDesc = ref('')
      const cashActive = ref(true)
      const creditActive = ref(false)
      const discount = ref(parseFloat(0.00));
      const invoicesHold = ref(null)

      const showopeningBalanceModal = ref(false); 

      const openingBalance = ref("")

      const showclosingBalanceModal = ref();

      const productsStore = localForage.createInstance({
        name: 'corvsellerDB',
        storeName: 'products'
      });
      const holdInvoicesStore = localForage.createInstance({
        name: 'corvsellerDB',
        storeName: 'holdInvoices'
      });
      const openBalanceStore = localForage.createInstance({
        name: 'corvsellerDB',
        storeName: 'offlineBalance'
      });
      const offlineInvoicesStore = localForage.createInstance({
        name: 'corvsellerDB',
        storeName: 'offlineInvoices'
      });

      const offlineSyncStore = useOfflineSyncStore()

      const storeCustomers = async () => {
        // console.log(getApiUrl('customers/search'))
        try {

          // const response = await axios.get(`${BASE_URL}customers/search`, {
            const response = await axios.get(getApiUrl('customers/search'),{
            params:{
              storeID: store.value.id,
              status: 'active',
              needle: '',
            }
          })
          if(response.data.body.customers){
            const parsedCustomers = JSON.parse(response.data.body.customers);
            customersLoaded.value = parsedCustomers
            // console.log(customersLoaded.value)
            // store.value['customers'] = parsedCustomers;
          }else{
            // store.value['customers'] = null
            customersLoaded.value = null
          }												
        } catch (error) {
          console.error(error);
          // store.value['customers'] = null
          customersLoaded.value = null
        }
      }; 
      const storeTransferPOSAccounts = async () => {
        try {
          getApiUrl('customers/search')
          const response = await axios.get(getApiUrl('banks/load-Store-TransferPOSAccounts'), {
            params:{
              storeID: store.value.id,
              userID: user.value.id,
            }
          })
          const parsedPOSBanks = JSON.parse(response.data.body.data.POSBanks);
          const parsedTransferBanks = JSON.parse(response.data.body.data.TransferBanks).filter(bank => bank.isActive === "1");;
          store.value['TransferBanks'] = parsedTransferBanks
          store.value['POSBanks'] = parsedPOSBanks
            if (Array.isArray(parsedPOSBanks) && parsedPOSBanks.length === 1) {
              posBank.value = parsedPOSBanks[0].id
            } else if (!Array.isArray(parsedPOSBanks) && typeof parsedPOSBanks === 'object') {
              posBank.value = parsedPOSBanks[0].id
            }
            if (Array.isArray(parsedTransferBanks) && parsedTransferBanks.length === 1) {
              transferBank.value = parsedTransferBanks[0].id
            } else if (!Array.isArray(parsedTransferBanks) && typeof parsedTransferBanks === 'object') {
              transferBank.value = parsedTransferBanks[0].id
            }
        } catch (error) {
          console.error(error);
          store.value['customers'] = null
        }
      }; 

      const generateUniqueID = () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2); // Get the full year (YYYY format)
        const month = now.getMonth() + 1; // Months are 0-indexed
        const day = now.getDate();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const second = now.getSeconds();
        const millisecond = now.getMilliseconds();
        const uniqueID = `${year}${month}${day}${hour}${minute}${second}${millisecond}`;
        return uniqueID;
      };
      const generateTimeStamp = () => {
        const invTimeStamp = new Date(); // Create a Date object for current time
        const year = invTimeStamp.getFullYear();
        const month = (invTimeStamp.getMonth() + 1).toString().padStart(2, '0');
        const day = invTimeStamp.getDate().toString().padStart(2, '0');
        const hour = invTimeStamp.getHours().toString().padStart(2, '0');
        const minute = invTimeStamp.getMinutes().toString().padStart(2, '0');
        const second = invTimeStamp.getSeconds().toString().padStart(2, '0');
        const formattedTimestamp = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        return formattedTimestamp;
      }
      const focusOnInputLoadData = () => {
        const productInput = document.getElementById("productInput");
        if (productInput) {
          productInput.focus();
        }
      };
      const swalSuccess = (title, msg, showConfirmButton, confirmButtonText) => {
        Swal.fire({
            icon: 'success',
            title: title,
            html: `<span style="color:#2C2; background-color:#EFE; padding:10px; margin-top:5px; border:1px solid #ACA; border-radius:10px; line-height:100px;">
                    <b>${msg}</b></span>`,
            showConfirmButton: showConfirmButton,
            confirmButtonText: confirmButtonText,
            reverseButtons: true,
            showCloseButton: true,
            allowOutsideClick: false
        });
      };
      const swalError = (title, msg) => {
          Swal.fire({
              icon: 'error',
              title: title,
              html: msg,
              showConfirmButton: false,
              showCloseButton: true,
              allowOutsideClick: false
          });
      };
      const swalWarning = (title, msg) => {
          Swal.fire({
              icon: 'warning',
              title: title,
              html: msg,
              showConfirmButton: false,
              showCloseButton: true,
              allowOutsideClick: false
          });
      };
      const clearInput = (txt) => {
        if(txt === 'cash'){
          cashRcv.value=""
          depositCashRcv.value=""
        }else if(txt === 'pos'){
          posRcv.value=""
          depositPosRcv.value=""
        }else if(txt === 'transfer'){
          transferRcv.value=""
          depositTransferRcv.value=""
        }else if(txt === 'openBalance'){
          openingBalance.value = ""
        }else if(txt === 'CashClosed'){
          CashClosed.value = ""
        }else if(txt === 'POSClosed'){
          POSClosed.value = ""
        }else if(txt === 'TransferClosed'){
          TransferClosed.value = ""
        }else if(txt === 'PettyExpClosed')	{
          PettyExpClosed.value = ""
        }else if(txt === 'current_password'){
          current_password.value = ""
        }else if(txt === 'new_password'){
          new_password.value = ""
        }else if(txt === 'confirm_password')	{
          confirm_password.value = ""
        }
      }
      const inputBlur = (txt) => {
        if(txt === 'cash'){
          if(cashRcv.value===""){
            cashRcv.value = 0
          }
        }else if(txt === 'pos'){
          if(posRcv.value===""){
            posRcv.value = 0
          }
        }else if(txt === 'transfer'){
          if(transferRcv.value===""){
            transferRcv.value = 0
          }
        }
      }
      const PayView = (view) => {
        if(view === 'cash'){
          cashActive.value = true
          creditActive.value = false
        }else if(view === 'credit'){
          creditActive.value = true
          cashActive.value = false
        }
      };

      const showpasswordModal = ref(false)
      const current_password = ref("")
      const new_password = ref("")
      const confirm_password = ref("")
      const passwordModal = async () => {
        await onlineStatusStore.initializeOnlineStatus();
          if (onlineStatusStore.online) {
            current_password.value = ""
            new_password.value = ""
            confirm_password.value = ""
            showpasswordModal.value = true
          }else{
            alertify.notify("No internet, operation requires Internet!", "error", 5);
          }
      };
      const closepasswordModal = () => {
        showpasswordModal.value = false
      }
      const updatePassword = async () => {
          if(!(current_password.value && new_password.value && confirm_password.value)){
              alertify.notify("Fill All the Fields!","error", 5)
              return false
          }
          if(new_password.value.length < 6){
              alertify.notify("New Password Should Be At least 6 Characters","error", 5)
              return false
          }
          if(new_password.value !== confirm_password.value){
              alertify.notify("New Password Mismatched!","error", 5)
              return false
          }
          try {
            loaderStore.showLoader()
              const response = await axios.post(getApiUrl('profile/change-password'), {
                storeID: store.value.id,
                userID: user.value.id,
                current_password: current_password.value,
                new_password: new_password.value,
              })
              loaderStore.hideLoader()
              if(response.data.message === "Successful"){
                current_password.value = ""
                new_password.value = ""
                confirm_password.value = ""
                swalSuccess('Updated!', 'Password Updated Successfully', false, false)
              }else if(response.data.message === "WrongPassword"){
                swalError('Error!', `Invalid Current Password`)
              }
          } catch (error) {
            loaderStore.hideLoader()
              console.error(error);
          }
      };  

      const showDepositModal = ref(false)
      const depositCashRcv = ref("")
      const depositPosRcv = ref("")
      const depositPosBank = ref("")
      const depositPosDesc = ref("")
      const depositTransferRcv = ref("")
      const depositTransferBank = ref("")
      const depositTransferDesc = ref("")
      const depositCusID = ref("")
      const depositCusBalance = ref("")
      const depositModal = async () => {
        await onlineStatusStore.initializeOnlineStatus();
          if (onlineStatusStore.online) {
            depositCashRcv.value = ""
            depositPosRcv.value = ""
            depositPosBank.value = ""
            depositPosDesc.value = ""
            depositTransferRcv.value = ""
            depositTransferBank.value = ""
            depositTransferDesc.value = ""
            depositCusID.value = ""
            depositCusBalance.value = ""
            showDepositModal.value = true
          }else{
            alertify.notify("No internet, operation requires Internet!", "error", 5);
          }
      };
      const closedepositModal = () => {
        showDepositModal.value = false
      }
      const depositTotalRcv = computed(() => {
        const cashValue = parseFloat(depositCashRcv.value) || 0;
        const posValue = parseFloat(depositPosRcv.value) || 0;
        const transferValue = parseFloat(depositTransferRcv.value) || 0;
        return parseFloat(cashValue + posValue + transferValue);
      });
      const customersLoaded = ref(null)

      const depositWhichCustomer = (event) => {    
        if(event.target.value){
          // console.log(customersLoaded.value)
          let customerD = customersLoaded.value.filter(item => {
            return item.id == event.target.value
          })
          depositCusBalance.value = parseFloat(customerD[0].balance)
        }else{
          depositCashRcv.value = 0 
          depositPosRcv.value = 0 
          depositPosBank.value = "" 
          depositPosDesc.value = ""
          depositTransferRcv.value = 0 
          depositTransferBank.value = ""
          depositTransferDesc.value = "" 
          depositCusBalance.value = 0 
          depositTotalRcv.value = 0 
        }
      };	
      const deposit = async () => {
        if (depositCashRcv.value !== '') {
          if (isNaN(depositCashRcv.value) || depositCashRcv.value < 0) {
            alertify.notify("Invalid Cash Amount Entered!", "error", 5);
            return false;
          }
        }
        if (depositPosRcv.value !== '') {
          if (isNaN(depositPosRcv.value) || depositPosRcv.value < 0) {
            alertify.notify("Invalid POS Amount Entered!", "error", 5);
            return false;
          }
          if (depositPosBank.value === '' && depositPosRcv.value > 0) {
            alertify.notify("Select a Valid POS Account!", "error", 5);
            return false;
          }
        }
        if (depositTransferRcv.value !== '') {
          if (isNaN(depositTransferRcv.value) || depositTransferRcv.value < 0) {
            alertify.notify("Invalid Transfer Amount Entered!", "error", 5);
            return false;
          }
          if (depositTransferBank.value === '' && depositTransferRcv.value > 0) {
            alertify.notify("Select a Valid Transfer Account!", "error", 5);
            return false;
          }
        }
        const cash = depositCashRcv.value === "" ? 0 : parseFloat(depositCashRcv.value)
        const pos = depositPosRcv.value === "" ? 0 : parseFloat(depositPosRcv.value)
        const transfer = depositTransferRcv.value === "" ? 0 : parseFloat(depositTransferRcv.value)
        const posB = depositPosBank.value
        const posD = depositPosDesc.value
        const transBank = depositTransferBank.value
        const transDesc = depositTransferDesc.value
        let customerD = customersLoaded.value.filter(item => {
          return item.id == depositCusID.value
        })
        try {
        
          loaderStore.showLoader()
          const uniqueID = generateUniqueID();
          const formattedTimestamp = generateTimeStamp();
          const existingOpenBalance = await getOpenBalance(store.value.id, user.value.id);
          
          const paymentData = JSON.stringify({
            Cash: { amount: cash, change: 0 },
            POS: { amount: pos, bankID: posB, refID: posD },
            BankTransfer: { amount: transfer, bankID: transBank, refID: transDesc },
            Credit: {amount: 0, cID: depositCusID.value, cDesc: "Repayment"}
          });
          const processedData = {
            storeID: store.value.id,
            userID: user.value.id,
            cusID: customerD[0].id,
            userD: user.value.name,
            invID: 2,
            name: customerD[0].name,
            uniqueID: uniqueID,
            tillSessionID:existingOpenBalance.uniqueID,
            cart: [],
            totalDue: (cash+pos+transfer),
            discount: 0,
            change: 0,
            totalRcv: (cash+pos+transfer),
            balance: parseFloat(customerD[0].balance)+(cash+pos+transfer),
            paymentData: paymentData,
            invTimeStamp:formattedTimestamp,
          };
         
          showDepositModal.value = false
          loaderStore.hideLoader()
          const response = await axios.post(getApiUrl('invoices/syncOfflineInvoices'), processedData);
          if (store.value.Settings && store.value.Settings.AutoPrint === 'Y') {
            printDepositReceipt(processedData, response.data.body.data.balance)
          }else{
            Swal.fire({
              icon: 'success',
              title: 'Deposited!',
              html: `Print`,
              showConfirmButton: true,
              confirmButtonText: 'Print',
              reverseButtons: true,
              showCloseButton: true,
              allowOutsideClick: false
            }).then((result) => {
              if (result.isConfirmed) {	
                printDepositReceipt(processedData, response.data.body.data.balance)
              }
            })
          }
          // focusOnInputLoadData()
          storeCustomers();
        } catch (error) {
          loaderStore.hideLoader()
          console.error(error);
        }
      }
      const printDepositReceipt = async (invoiceContent, balance) => {
        try {
          
          if (!invoiceContent) {
            throw new Error('Invoice not found');
          }
          const printWindow = window.open('', 'Receipt', 'width=800,height=600');
          printWindow.document.write(formatDepositReceiptContent(invoiceContent, balance));
          printWindow.document.close();
          await new Promise((resolve) => {
            printWindow.onload = resolve; // Ensure print window is fully loaded
          });
          printWindow.focus();
          await new Promise((resolve) => {
            printWindow.onafterprint = resolve; // Wait for print dialog to close
            printWindow.print(); // Explicitly trigger printing
          });
          // Close the print window after printing
            printWindow.close();
        } catch (error) {
          console.error('Error printing invoice:', error);
        }
      }
			const formatDepositReceiptContent = (invoiceContent, balance) => {
        // console.log(invoiceContent)
        const storeLogo = store.value.logo;
        const storeName = store.value.name;
        const storeAddress = store.value.address;
        const phones = store.value.phone_numbers;
        const userD = user.value.name;
        const invTimeStamp = invoiceContent.invTimeStamp;
        const invID = invoiceContent.uniqueID;
        // const CustomerName = invoiceContent.name;
        const CustomerName = invoiceContent.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
        const amount = invoiceContent.totalDue;
        // const balance = balance;
        const creditLimit = invoiceContent.creditLimit;
        const paymentData = JSON.parse(invoiceContent.paymentData);
        let paymentChannels;
          paymentChannels = Object.entries(paymentData)
            .filter(([key, value]) => value.amount > 0)
            .map(([key]) => key);
        return `
          <!DOCTYPE html>
          <html>
          <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: sans-serif;
              position: relative;
            }
            body::after {
              content: 'PAID';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 5em;
              color: rgba(0, 0, 0, 0.1);
              pointer-events: none;
            }
            h1,
            h2, h3 {
              margin-top: 1;
              margin-top: 0;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th,
            td {
              text-align: left;
              padding: 5px;
              border: 1px solid #ddd; /* Add a visible border */
            }
            .text-right {
              text-align: right;
            }
            #headPrint {
              width: 100%;
              display: flex;
              justify-content: flex-start;
              align-items: center;
              margin-bottom: 5px;
            }
            #printLogo {
              order: 1;
              width: 20%;
              text-align: center;
            }
            #printLogo img {
              max-width: 100%;
            }
            #printStore {
              order: 2;
              /*width: 80%;*/
              padding: 5px;
              width: ${storeLogo !== '' ? '80%' : '100%'}; /* Dynamically set width based on storeLogo */
              text-align: center;
            }
            .small-text {
              font-size: 0.8em;
            }
            #printId {
              text-align: center;
              font-weight: bold;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            #printCh {
              text-align: center;
              margin-bottom: 5px;
            }
          </style>
          </head>
          <body>
          <div id="headPrint">
            ${storeLogo !== '' ? `
            <div id="printLogo" align="center">
              <img src="${storeLogo}" style="width: 100px;">
            </div>
            ` : ''}
            <div id="printStore">
              <h3>${storeName}</h3>
              <p class="small-text">${storeAddress}</br>${phones}</p>
            </div>
          </div>
          <div id="printId" style="text-align:center; font-weight:bold; padding-bottom:1px;">P A I D | RMP-${invID}</div>
          <div id="printCh" style="text-align:center;">Channel(s) <b>${paymentChannels}</b><br/>
          <h3>${CustomerName}</h3>
          </div>
          <main>
            <table>
            <thead>
              <tr>
              <th>Received</th>
              <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${ngnFormatter.format(amount)}</td>
                <td>${ngnFormatter.format(balance)}</td>
              </tr>
            </tbody>
            </table>
          </main>
          <footer>
            <span><b>Staff: ${userD}</span><br />
            <span><b>Date: ${ invTimeStamp } </span><br /><hr />
          </footer>
          </body>
          </html>
        `;
			}


      const whichCustomer = (event) => {
        const cid = event.target.value;
        cashRcv.value= parseFloat(0.00)
        posRcv.value= parseFloat(0.00)
        posBank.value=''
        posDesc.value=''
        transferRcv.value= parseFloat(0.00)
        transferBank.value=''
        transferDesc.value=''
        creditRcv.value= parseFloat(0.00)
        cusLimit.value = parseFloat(0.00)
        cusBalance.value = parseFloat(0.00)
        cusDesc.value = ''
        if(cid > 0){
          // let customerD = store.value.customers.filter(item => {
          let customerD = customersLoaded.value.filter(item => {
            return item.id == cid
          })
          cusLimit.value = parseFloat(customerD[0].creditLimit)
          cusBalance.value = parseFloat(customerD[0].balance)
          if((cusBalance.value-totalDue.value) >= cusLimit.value){
            isCustomer.value = true
            maxLimit.value = false
            creditRcv.value = parseFloat(totalDue.value)
          }else{
            isCustomer.value = false
            maxLimit.value = true
            alertify.notify("Customer Credit Limit Reached","error",5);
          }
        }else{
          isCustomer.value = false
          maxLimit.value = true
        }
      };
      const total = computed(() => {
        const subtotal = cart.value.reduce((acc, item) => {
          return acc + (item.Sub);
        }, 0);
        return Math.round(subtotal);
      });
      const totalRcv = computed(() => {
        const cashValue = parseFloat(cashRcv.value) || 0;
        const posValue = parseFloat(posRcv.value) || 0;
        const transferValue = parseFloat(transferRcv.value) || 0;
        const creditValue = parseFloat(creditRcv.value) || 0;
        return cashValue + posValue + transferValue + creditValue;
      });
      watch([discount,totalRcv], (newVal, oldVal) => {
        if(isCustomer.value && !maxLimit.value){
          creditRcv.value = parseFloat(totalDue.value)
        }
      });
      watch(cart, (newCart, oldCart) => {
        for (let i = 0; i < newCart.length; i++) {
          const item = newCart[i];
          if (item.discounts && item.discounts.length > 0) {
            // Sort discounts in descending order based on quantity
            const sortedDiscounts = item.discounts.sort((a, b) => b.qty - a.qty);
            let selectedDiscount = null;
            // Find the first discount with a quantity less than or equal to the item quantity
            for (let j = 0; j < sortedDiscounts.length; j++) {
              if (sortedDiscounts[j].qty <= item.qty) {
                selectedDiscount = sortedDiscounts[j];
                break;
              }
            }
            if (selectedDiscount) {
              // Calculate the number of times the discount applies
              const discountApplications = Math.floor(item.qty / selectedDiscount.qty);
              // Calculate the discounted price for the discount-applicable quantity
              const discountedPrice = discountApplications * selectedDiscount.price;
              // Calculate the price for the remaining quantity
              const remainingQty = item.qty % selectedDiscount.qty;
              const remainingPrice = remainingQty * item.sellingPrice;
              // Assign the total price
              item.Sub = Math.floor((discountedPrice + remainingPrice)); // Round down to remove decimal points
            } else {
              // No applicable discount, use the regular price
              item.Sub = item.sellingPrice * item.qty;
            }
          } else {
            // No discount, use the regular price
            item.Sub = item.sellingPrice * item.qty;
          }
          console.log(`Selling ${item.brand} at ${item.Sub} after discount QTY ${item.qty}`);
        }
      }, { deep: true });
      const totalDue = computed(() => {
        if(parseFloat(total.value) >= parseFloat(discount.value)){
          return parseFloat(total.value) - parseFloat(discount.value)
        }else{
          return parseFloat(0.00)
        }
      });
      const totalChange = computed(() => {
        if(parseFloat(totalRcv.value) > parseFloat(totalDue.value)){
          return parseFloat(totalRcv.value) - parseFloat(totalDue.value)
        }else{
          return parseFloat(0.00)
        }
      });				
      const toBeProcessed = computed(() => {
        return totalRcv.value >= totalDue.value;
      })
      const searchProductsInLocalForage = async (searchTerm) => {
        try {
          const products = await offlineSyncStore.getProductsFromLocalForage();
          const searchTermLower = searchTerm.toLowerCase();
          return products.filter(product => 
            product.brand.toLowerCase().includes(searchTermLower) ||
            product.productCode.toLowerCase().includes(searchTermLower) ||
            (product.description && JSON.stringify(product.description).toLowerCase().includes(searchTermLower)) ||
            (product.generics && JSON.stringify(product.generics).toLowerCase().includes(searchTermLower))
          );
        } catch (error) {
          console.error('Error searching products in localForage:', error);
          return [];
        }
      };

      const handleSearch = async () => {
        if (needle.value.trim() === '') {
          searchResults.value = [];
          return;
        }
        try {
          searchResults.value = await searchProductsInLocalForage(needle.value);
        } catch (error) {
          console.error('Error searching products:', error);
          searchResults.value = [];
        }
      };
      const addToCart = (product) => {
        console.log(product)
        cart.value.push(product)
        needle.value = '';
        searchResults.value = [];
      };
      const qtyKeyUp = (index,qty) => {
        // console.log(index,qty)
        // alertify.alert('Title', 'This is a simple alert message');
        qty = Number(qty) > 0 ? Number(qty) : 1;
						if (store.value.Settings && store.value.Settings.SalesQty === 'Y') {
							cart.value[index].qty = qty;
						} else {
							if (qty > cart.value[index].stockQty) {
								alertify.notify("The Quantity you entered is greater than the available stock!", "error", 5);
								cart.value[index].qty = cart.value[index].stockQty;
							} else {
								cart.value[index].qty = qty;
							}
						}
        updateSubTotal(index);
      };
      const increaseQuantity = (index,qty) => {
        cart.value[index].qty = cart.value[index].qty + qty;
        updateSubTotal(index);
      };
      const decreaseQuantity = (index,qty) => {
        if (cart.value[index].qty > 1) {
          cart.value[index].qty = cart.value[index].qty - qty;
          updateSubTotal(index);
        }
      };
      const deleteItem = (index) => {
          cart.value.splice(index, 1);
          // updateCart();
			};
      const cartClear = () => {
        cart.value = [];
      };

      const updateSubTotal = (index) => {
        const item = cart.value[index];
        item.Sub = item.qty * item.discounted;
      };
      const openPaymentModal = () => {
        cashRcv.value = 0
        posRcv.value = 0
        posDesc.value = ""
        transferRcv.value = 0
        transferDesc.value = ""
        showPaymentModal.value = true;
        // console.log(showPaymentModal.value)
      };
      const closePaymentModal = () => {
        showPaymentModal.value = false;
      };


      const processPayment = async () => {
        let posTrans = parseFloat(posRcv.value) + parseFloat(transferRcv.value);
        if (posTrans > totalDue.value) {
          alertify.notify("Invalid POS or Transfer Amount Entered...", "error", 3);
          return false;
        }
        try {
          loaderStore.showLoader()
          const paymentData = JSON.stringify({
            Cash: { amount: cashRcv.value, change: totalChange.value },
            POS: { amount: posRcv.value, bankID: posBank.value, refID: posDesc.value },
            BankTransfer: { amount: transferRcv.value, bankID: transferBank.value, refID: transferDesc.value },
            Credit: { amount: creditRcv.value, cID: selectedCustomer.value, cDesc: cusDesc.value },
          });
          const existingOpenBalance = await getOpenBalance(store.value.id, user.value.id);
          const processedData = {
            storeID: store.value.id,
            userID: user.value.id,
            userD: user.value.name,
            invID: 0,
            uniqueID: generateUniqueID(),
            tillSessionID:existingOpenBalance.uniqueID,
            cart: cart.value,
            totalDue: totalDue.value,
            discount: discount.value,
            change: totalChange.value,
            totalRcv: totalRcv.value,
            paymentData: paymentData,
            invTimeStamp:generateTimeStamp(),
          };
          saveLocalInvoiceData(processedData);
          handlePaidSuccess(processedData);
          focusOnInputLoadData()
          loaderStore.hideLoader()
        } catch (error) {
          console.error(error);
          loaderStore.hideLoader()
        }
      };
      // Function to save local invoice data to IndexedDB
      const saveLocalInvoiceData = async (data) => {    
        try {
          if (data.cart.length > 0) {
            const invoiceData = JSON.parse(JSON.stringify(data));
            await offlineInvoicesStore.setItem(invoiceData.uniqueID, invoiceData);
            await subtractQtyFromProducts(data.cart)
            offlineInvoicesCount.value += 1;
          }
        } catch (error) {
          console.error('Error saving invoice data:', error);
        }
      }
      // Function to subtract quantity from products
      const subtractQtyFromProducts = async (cart) => {
        try {
            // Retrieve the current products from IndexedDB
            const products = await productsStore.getItem('products') || [];
            for (const cartItem of cart) {
              const { SID, qty } = cartItem; // Destructure SID and qty from the cart item
              // Find the product in the products array using SID
              const productIndex = products.findIndex(product => product.SID === SID);
              // If the product is found, subtract the quantity
              if (productIndex !== -1) {
                products[productIndex].stockQty -= qty; // Subtract the quantity from stockQty
              } else {
                console.log(`Product with SID: ${SID} not found.`);
              }
            }
            // Save the updated products back to IndexedDB
            await productsStore.setItem('products', products)
            console.log("Products updated in IndexedDB successfully.");
        } catch (error) {
          console.error('Error subtracting quantities from products:', error);
        }
      }
      const handlePaidSuccess = (savedInvoiceItem) => {
        // return false;
        closePaymentModal()
        cart.value = [];
        // products.value = [];
        // loaderStore.showLoader()
        if (store.value.Settings && store.value.Settings.AutoPrint === 'Y') {
          //printPaidInvoice(savedInvoiceItem); // Call the print function directly
          loaderStore.hideLoader()
          var msg;
        	if (parseFloat(savedInvoiceItem.change) > 0) {
        		msg = `<span style="color:#2C2; background-color:#EFE; padding:10px; margin-top:5px; border:1px solid #ACA; border-radius:10px; line-height:100px;">
        		<b>Change: ${savedInvoiceItem.change}</b>
        		</span>`;
        		Swal.fire({
        			icon: 'success',
        			title: 'Invoice Processed!',
        			html: msg,
        			showConfirmButton: true,
        			confirmButtonText: 'done',
        			reverseButtons: true,
        			showCloseButton: true,
        			allowOutsideClick: false
        		}).then((result) => {
        			if (result.isConfirmed) { 
        				focusOnInputLoadData()
        			}
        		});
        	}
        }else{
          loaderStore.hideLoader()
        	var msg;
        	if (parseFloat(savedInvoiceItem.change) > 0) {
        		msg = `<span style="color:#2C2; background-color:#EFE; padding:10px; margin-top:5px; border:1px solid #ACA; border-radius:10px; line-height:100px;">
        		<b>Change: ${savedInvoiceItem.change}</b>
        		</span>`;
        	}
        	Swal.fire({
        		icon: 'success',
        		title: 'Invoice Processed!',
        		html: msg,
        		showConfirmButton: true,
        		confirmButtonText: 'Print',
        		reverseButtons: true,
        		showCloseButton: true,
        		allowOutsideClick: false
        	}).then((result) => {
        		if (result.isConfirmed) {
        			printPaidInvoice(savedInvoiceItem); // Call the print function directly
        			focusOnInputLoadData()
        		}
        	});
        }
        loaderStore.hideLoader()
      };
      const printPaidInvoice = async (invoiceContent) => {
        try {
          const printWindow = window.open('', 'Receipt', 'width=800,height=600');
          printWindow.document.write(formatPaidReceiptContent(invoiceContent));
          printWindow.document.close();
          await new Promise((resolve) => {
            printWindow.onload = resolve; // Ensure print window is fully loaded
          });
          printWindow.focus();
          await new Promise((resolve) => {
            printWindow.onafterprint = resolve; // Wait for print dialog to close
            printWindow.print(); // Explicitly trigger printing
          });
            printWindow.close();
            focusOnInputLoadData()
        } catch (error) {
          console.error('Error printing invoice:', error);
        }
      }
      const formatPaidReceiptContent = (invoiceContent) => {
        const storeLogo = store.value.logo;
        const storeName = store.value.name;
        const storeAddress = store.value.address;
        const phones = store.value.phone_numbers;
        const userD = invoiceContent.userD;
        const invTimeStamp = invoiceContent.invTimeStamp;
        const invID = invoiceContent.uniqueID;
        const items = invoiceContent.cart;
        const totalDue = invoiceContent.totalDue;
        const paymentData = JSON.parse(invoiceContent.paymentData);
        let paymentChannels;
        if (paymentData.Credit.amount > 0 && paymentData.Credit.cID) {
          const customer = store.value.customers.find(item => item.id === paymentData.Credit.cID);
          const CustomerName = customer.name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
          paymentChannels = customer ? 'Credit To '+CustomerName : null;
        } else {
          paymentChannels = Object.entries(paymentData)
            .filter(([key, value]) => value.amount > 0)
            .map(([key]) => key);
        }
        return `
          <!DOCTYPE html>
          <html>
          <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: sans-serif;
              position: relative;
            }
            body::after {
              content: 'PAID';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 5em;
              color: rgba(0, 0, 0, 0.1);
              pointer-events: none;
            }
            h1,
            h2, h3 {
              margin-top: 1;
              margin-top: 0;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th,
            td {
              text-align: left;
              padding: 5px;
              border: 1px solid #ddd; /* Add a visible border */
            }
            .text-right {
              text-align: right;
            }
            #headPrint {
              width: 100%;
              display: flex;
              justify-content: flex-start;
              align-items: center;
              margin-bottom: 5px;
            }
            #printLogo {
              order: 1;
              width: 20%;
              text-align: center;
            }
            #printLogo img {
              max-width: 100%;
            }
            #printStore {
              order: 2;
              /*width: 80%;*/
              padding: 5px;
              width: ${storeLogo !== '' ? '80%' : '100%'}; /* Dynamically set width based on storeLogo */
              text-align: center;
            }
            .small-text {
              font-size: 0.8em;
            }
            #printId {
              text-align: center;
              font-weight: bold;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            #printCh {
              text-align: center;
              margin-bottom: 5px;
            }
          </style>
          </head>
          <body>
          <div id="headPrint">
            ${storeLogo !== '' ? `
            <div id="printLogo" align="center">
              <img src="${storeLogo}" alt="Logo" style="width: 100px;">
            </div>
            ` : ''}
            <div id="printStore">
              <h3>${storeName}</h3>
              <p class="small-text">${storeAddress}</br>${phones}</p>
            </div>
          </div>
          <div id="printId" style="text-align:center; font-weight:bold; padding-bottom:1px;">P A I D | INV-${invID}</div>
          <div id="printCh" style="text-align:center;">Channel(s) <b>${paymentChannels}</b></div>
          <main>
            <table>
            <thead>
              <tr>
              <th>SN</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.brand}</td>
                <td>${item.qty}</td>
                <td>${ngnFormatter.format(item.sellingPrice)}<br/>/${item.stockIn}</td>
                <td>${ngnFormatter.format(item.Sub)}</td>
              </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
              <th colspan="4" class="text-right">Total:</th>
              <td><b>${ngnFormatter.format(totalDue)}</b></td>
              </tr>
            </tfoot>
            </table>
          </main>
          <footer>
            <span><b>Staff: ${userD}</span><br />
            <span><b>Date: ${invTimeStamp} </span><br /><hr />
            <span><b>${ store.value.settings.salesMsg }</b></span><br /><hr />
            <span>Powered By: www.corvseller.com</span>
          </footer>
          </body>
          </html>
        `;
      }

      const getOfflineBalance = async () => {
        try {
          const keys = await openBalanceStore.keys();
          const openBalances = await Promise.all(
            keys.map(async key => {
              const openBalance = await openBalanceStore.getItem(key);
              if (!openBalance) console.warn(`No openBalance found for key: ${key}`);
              return openBalance;
            })
          );
          console.log(`Retrieved ${openBalances.filter(Boolean).length} openBalances`);
          return openBalances.filter(Boolean);
        } catch (error) {
          console.error('Error retrieving offline openBalances:', error);
          throw error; // Propagate error for better handling in calling function
        }
      };
      const CashClosed = ref(0)
      const POSClosed = ref(0)
      const TransferClosed = ref(0)
      const PettyExpClosed = ref(0)
      const ExpDescClosed = ref('')
      const getOpenBalance = async (storeID, userID) => {
        try {
          // Retrieve all keys from the offlineBalance store
          const allKeys = await openBalanceStore.keys();   
          // Fetch all balances
          const balances = await Promise.all(allKeys.map(async (key) => {
            return await openBalanceStore.getItem(key);
          }));
          // Find the existing open balance
          const openBalance = balances.find(item => 
            item.isActive === 0 && 
            item.storeID === storeID && 
            item.userID === userID
          );
          return openBalance || null; // Return the found balance or null if not found
        } catch (error) {
          console.error('Error retrieving open balance:', error);
          return null; // Return null in case of error
        }
      };
      const openingBalanceModal = async () => {
        const existingOpenBalance = await getOpenBalance(store.value.id, user.value.id);
        if (!existingOpenBalance) {
          showopeningBalanceModal.value = true
        }
      }
      const saveOpeningBalance = async () => {					
        if (parseFloat(openingBalance.value) < 0 || isNaN(openingBalance.value)) {
          alertify.notify("Invalid Opening Balance...", "error");
          return false;
        }
        // loaderStore.showLoader()
        // Check for existing open balance
        const existingOpenBalance = await getOpenBalance(store.value.id, user.value.id);
        // If no opened balance is found, create a new one
        if (!existingOpenBalance) {
          const tendered = {
            'Open': openingBalance.value === "" ? 0 : parseFloat(openingBalance.value),
            'Cash': 0,
            'POS': 0,
            'Transfer': 0,
            'PettyExp': 0,
            'ExpDesc': 0,
          };
          const data = {
            uniqueID: generateUniqueID(),
            userAgent: tillD.value.code,
            storeID: store.value.id,
            userID: user.value.id,
            openBy: user.value.id,
            closeBy: 0,
            tendered: tendered,
            openTimeStamp: generateTimeStamp(),
            closeTimeStamp: '0000-00-00 00:00:00',
            isActive: 0,
          };
          try {
            // Store the data in offlineBalance
            await openBalanceStore.setItem(data.uniqueID, data);
            console.log('Opening balance saved successfully:', data);
          } catch (error) {
            console.error('Error saving opening balance:', error);
          }
        }
        // syncOfflineBalance();
        showopeningBalanceModal.value = false
        openingBalance.value = ""
        // loaderStore.hideLoader()
      }
      const closeclosingBalanceModal = () => {
        showclosingBalanceModal.value = false;
      };
      const closingBalanceModal = async () => {      
        const offlineBalance = await getOfflineBalance();  
        const openBalance = offlineBalance.find(item => 
          item.isActive === 0 && 
          item.storeID === store.value.id && 
          item.userID === user.value.id
        );
        if (openBalance) {
          CashClosed.value = ""
          POSClosed.value = ""
          TransferClosed.value = ""
          PettyExpClosed.value = ""
          ExpDescClosed.value = ""
          showclosingBalanceModal.value = true
        }else{
            syncOfflineBalance();
        }
      }

      const saveClosingBalance = async () => {
        try {
          // Validate all amounts at once using a validation map
          const amountValidations = [
            { value: CashClosed.value, label: 'Cash' },
            { value: POSClosed.value, label: 'POS' },
            { value: TransferClosed.value, label: 'Transfer' },
            { value: PettyExpClosed.value, label: 'PettyCash' }
          ];
          // Early validation check
          const isInvalid = amountValidations.some(({ value, label }) => {
            if (value !== '' && (isNaN(value) || value < 0)) {
              alertify.notify(`Invalid ${label} Amount Entered!`, 'error', 5);
              return true;
            }
            return false;
          });
          if (isInvalid) return false;
          loaderStore.showLoader();
          // Get offline balance and find opened balance
          const offlineBalanceAll = await getOfflineBalance();
          const openedBalance = offlineBalanceAll.find(item => (
            item.isActive === 0 && 
            item.storeID === store.value.id && 
            item.userID === user.value.id
          ));
          if (!openedBalance) {
            alertify.notify('No open balance found!', 'error', 5);
            return false;
          }
          // Parse amounts using a helper function
          const parseAmount = value => value === '' ? 0 : parseFloat(value);
          // Create tendered object
          const tendered = {
            Open: openedBalance.tendered.Open,
            Cash: parseAmount(CashClosed.value),
            POS: parseAmount(POSClosed.value),
            Transfer: parseAmount(TransferClosed.value),
            PettyExp: parseAmount(PettyExpClosed.value),
            ExpDesc: ExpDescClosed.value
          };
          // Create balance data
          const balanceData = {
            uniqueID: openedBalance.uniqueID,
            storeID: store.value.id,
            userID: user.value.id,
            openBy: openedBalance.userID,
            closeBy: user.value.id,
            tendered,
            openTimeStamp: openedBalance.openTimeStamp,
            closeTimeStamp: generateTimeStamp(),
            userAgent: openedBalance.userAgent,
            isActive: 1
          };
          // Save balance data
          await openBalanceStore.setItem(balanceData.uniqueID, balanceData);
          loaderStore.hideLoader();
          // Show success dialog and handle actions
          const { isConfirmed, isDenied } = await Swal.fire({
            icon: 'success',
            title: 'Shift Closed!',
            html: 'Print and Logout',
            reverseButtons: false,
            showDenyButton: true,
            showCancelButton: false,
            denyButtonText: 'Logout',
            confirmButtonText: 'Print',
            showCloseButton: false,
            allowOutsideClick: false
          });
          // Handle user action
          if (isConfirmed) {
            showclosingBalanceModal.value = false
            await printShiftCloseReceipt(balanceData);
            authStore.logout()
          } else if (isDenied) {
            showclosingBalanceModal.value = false
            authStore.logout()
          }
          return true;
        } catch (error) {
          loaderStore.hideLoader();
          console.error('Error saving closing balance:', error);
          alertify.notify('Failed to save closing balance', 'error', 5);
          return false;
        } finally {
          loaderStore.hideLoader();
        }
      };
      const printShiftCloseReceipt = async (invoiceContent) => {
        try {
          
          if (!invoiceContent) {
            throw new Error('Invoice not found');
          }
          const printWindow = window.open('', 'Receipt', 'width=800,height=600');
          printWindow.document.write(formatShiftCloseReceiptContent(invoiceContent));
          printWindow.document.close();
          await new Promise((resolve) => {
            printWindow.onload = resolve; // Ensure print window is fully loaded
          });
          printWindow.focus();
          await new Promise((resolve) => {
            printWindow.onafterprint = resolve; // Wait for print dialog to close
            printWindow.print(); // Explicitly trigger printing
          });
          // Close the print window after printing
            printWindow.close();
          // window.location.href = "/logout";
        } catch (error) {
          console.error('Error printing Closing Shift:', error);
        }
      }
      const formatShiftCloseReceiptContent = (invoiceContent) => {
        const storeLogo = store.value.logo;
        const storeName = store.value.name;
        // const storeAddress = store.value.address;
        // const phones = store.value.phone_numbers;
        const userD = user.value.title+" "+user.value.name;
        const invTimeStamp = generateTimeStamp;
          return `
            <!DOCTYPE html>
            <html>
            <head>
            <title>Receipt</title>
            <style>
              body {
                font-family: sans-serif;
                position: relative;
              }
              body::after {
                content: 'Confirmed';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 5em;
                color: rgba(0, 0, 0, 0.1);
                pointer-events: none;
              }
              h1,
              h2, h3 {
                margin-top: 1;
                margin-top: 0;
              }
              table {
                border-collapse: collapse;
                width: 100%;
              }
              th,
              td {
                text-align: left;
                padding: 5px;
                border: 1px solid #ddd; /* Add a visible border */
              }
              .text-right {
                text-align: right;
              }
              #headPrint {
                width: 100%;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                margin-bottom: 5px;
              }
              #printLogo {
                order: 1;
                width: 20%;
                text-align: center;
              }
              #printLogo img {
                max-width: 100%;
              }
              #printStore {
                order: 2;
                /*width: 80%;*/
                padding: 5px;
                width: ${storeLogo !== '' ? '80%' : '100%'}; /* Dynamically set width based on storeLogo */
                text-align: center;
              }
              .small-text {
                font-size: 0.8em;
              }
              #printId {
                text-align: center;
                font-weight: bold;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              #printCh {
                text-align: center;
                margin-bottom: 5px;
              }
            </style>
            </head>
            <body>
            <div id="headPrint">
              ${storeLogo !== '' ? `
              <div id="printLogo" align="center">
                <img src="${storeLogo}" style="width: 100px;">
              </div>
              ` : ''}
              <div id="printStore">
                <h3>${storeName}</h3>
              </div>
            </div>
            </div>
            <main>
              <table>
              <thead>
                <tr>
                  <th colspan=2>Opened</th>
                  <th colspan=2>Closed</th>
                </tr>
                <tr>
                  <th colspan=2>${invoiceContent.openTimeStamp}</th>
                  <th colspan=2>${invoiceContent.closeTimeStamp}</th>
                </tr>
                <tr>
                  <th>Cash</th>
                  <th>POS</th>
                  <th>Transfer</th>
                  <th>Cash Spent</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${ngnFormatter.format(invoiceContent.tendered.Cash)}</td>
                  <td>${ngnFormatter.format(invoiceContent.tendered.POS)}</td>
                  <td>${ngnFormatter.format(invoiceContent.tendered.Transfer)}</td>
                  <td>${ngnFormatter.format(invoiceContent.tendered.PettyExp)}</td>
                </tr>
                <tr>
                  <td>Spent Desc:</td>
                  <td colspan=3>${invoiceContent.tendered.ExpDesc}</td>
                </tr>
              </tbody>
              </table>
            </main>
            <footer>
              <span><b>Generated By: ${userD}</span><br /> <br /> 
              <span><b>Received By:</span><br /><hr />
            </footer>
            </body>
            </html>
          `;
      }
			
      const holdInvoice = async () => {
        if (cart.value.length > 0) {
          const data = {
            invID: generateUniqueID(),
            storeID: store.value.id,
            userID: user.value.id,
            userD: user.value.name,
            cart: cloneDeep(cart.value.map(item => ({
              ...item,
              descriptionAll: item.descriptionAll ? JSON.parse(JSON.stringify(item.descriptionAll)) : {},
              discounts: item.discounts ? JSON.parse(JSON.stringify(item.discounts)) : [],
              generics: item.generics ? JSON.parse(JSON.stringify(item.generics)) : null
            }))),
            totalDue: totalDue.value,
            invTimeStamp: generateTimeStamp(),
          };
          try {
            // Serialize the entire data object
            const serializedData = JSON.parse(JSON.stringify(data));
            // Fetch existing invoices
            let holdInvoices = await holdInvoicesStore.getItem('invoices') || [];
            // Add new serialized invoice
            holdInvoices.push(serializedData);           
            // Store the updated array of invoices
            await holdInvoicesStore.setItem('invoices', holdInvoices);       
            // Update the reactive reference
            invoicesHold.value = holdInvoices;
            cart.value = []
            console.log('Invoice held successfully');
            alertify.notify("Invoice held successfully", "success", 3);
          } catch (error) {
            console.error('Error holding invoice:', error);
            alertify.notify("Failed to hold invoice. Please try again.", "error", 5);
          }
        } else {
          alertify.notify("No item on Cart to hold", "error", 3);
          return false;
        }
      };
      const loadAllHoldInvoices = async () => {
        try {
          // Attempt to retrieve the 'invoices' item which contains all held invoices
          let holdInvoices = await holdInvoicesStore.getItem('invoices');
          // console.log(holdInvoices)
          // If 'invoices' doesn't exist or is not an array, initialize it
          if (!Array.isArray(holdInvoices)) {
            holdInvoices = [];
          }
          return holdInvoices;
        } catch (error) {
          console.error('Error loading held invoices:', error);
          alertify.notify("Failed to load held invoices. Please try again.", "error", 5);
          return [];
        }
      };
      const fetchHeldInvoices = async () => {
        invoicesHold.value = await loadAllHoldInvoices();
      };
      const handleInvoiceHeld = async (uniqueID) => {
        await loadHoldInvoice(uniqueID);
        // Any additional logic after loading the invoice
      };
      const loadHoldInvoice = async (uniqueID) => {
        try {
          // Fetch all hold invoices
          let holdInvoices = await holdInvoicesStore.getItem('invoices') || [];     
          // Find the invoice to return to cart
          const returnToCart = holdInvoices.find(invoice => 
            invoice.invID === uniqueID && invoice.storeID === store.value.id
          );
          if (!returnToCart) {
            console.error('Invoice not found');
            alertify.notify("Invoice not found", "error", 3);
            return;
          }
          // Update the cart
          cart.value = returnToCart.cart;
          // Filter out the loaded invoice
          const updatedHoldInvoices = holdInvoices.filter(invoice => 
            !(invoice.invID === uniqueID && invoice.storeID === store.value.id)
          );
          // Update the stored invoices
          await holdInvoicesStore.setItem('invoices', updatedHoldInvoices);

          // Update the reactive reference
          invoicesHold.value = updatedHoldInvoices;
          // alertify.notify("Invoice loaded successfully", "success", 3);
        } catch (error) {
          console.error('Error loading hold invoice:', error);
          alertify.notify("Failed to load invoice. Please try again.", "error", 5);
        }
      };

      const clearHold = async () => {
          // const loaderStore = useLoaderStore();
          const isDeletingRef = ref(false);

          try {
            isDeletingRef.value = true;
            // loaderStore.showLoader();

            const result = await Swal.fire({
              title: 'Are you sure?',
              text: "You won't be able to revert this!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, delete all!'
            });

            if (result.isConfirmed) {
              await holdInvoicesStore.setItem('invoices', []);
              invoicesHold.value = []
              
              await Swal.fire(
                'Deleted!',
                'All hold invoices have been cleared.',
                'success'
              );
              return true;
            }
            return false;
          } catch (error) {
            console.error('Error clearing hold invoices:', error);
            await Swal.fire(
              'Error!',
              'Failed to clear hold invoices.',
              'error'
            );
            return false;
          } finally {
            isDeletingRef.value = false;
            // loaderStore.hideLoader();
          }
        // };
      };

      watch(cart, (newCart, oldCart) => {
						for (let i = 0; i < newCart.length; i++) {
							const item = newCart[i];
							if (item.discounts && item.discounts.length > 0) {
								// Sort discounts in descending order based on quantity
								const sortedDiscounts = item.discounts.sort((a, b) => b.qty - a.qty);
								let selectedDiscount = null;
								// Find the first discount with a quantity less than or equal to the item quantity
								for (let j = 0; j < sortedDiscounts.length; j++) {
									if (sortedDiscounts[j].qty <= item.qty) {
										selectedDiscount = sortedDiscounts[j];
										break;
									}
								}
								if (selectedDiscount) {
									// Calculate the number of times the discount applies
									const discountApplications = Math.floor(item.qty / selectedDiscount.qty);
									// Calculate the discounted price for the discount-applicable quantity
									const discountedPrice = discountApplications * selectedDiscount.price;
									// Calculate the price for the remaining quantity
									const remainingQty = item.qty % selectedDiscount.qty;
									const remainingPrice = remainingQty * item.sellingPrice;
									// Assign the total price
									item.Sub = Math.floor((discountedPrice + remainingPrice)); // Round down to remove decimal points
								} else {
									// No applicable discount, use the regular price
									item.Sub = item.sellingPrice * item.qty;
								}
							} else {
								// No discount, use the regular price
								item.Sub = item.sellingPrice * item.qty;
							}
							// console.log(`Selling ${item.brand} at ${item.Sub} after discount QTY ${item.qty}`);
						}
			}, { deep: true });
      /// Scanner Configuration
      const SCANNER_CONFIG = {
        DEBOUNCE: 50,
        BATCH_SIZE: 5,
        MAX_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
        TIMEOUT: 30000,
        VIDEO: {
          WIDTH: { ideal: 1280, max: 1920 },
          HEIGHT: { ideal: 720, max: 1080 },
          FRAME_RATE: { ideal: 30, min: 20 },
          ASPECT_RATIO: 16/9
        }
      };
      // State Management
      const codeReader = ref(null);
      const videoElement = ref(null);
      const isScanning = ref(false);
      const isLoading = ref(false);
      const hasError = ref(false);
      const scannerStatus = ref('Position barcode in the frame');
      const scanAttempts = ref(0);
      // Video Configuration
      const videoConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      };
      const initializeScanner = async () => {
        try {
          if (codeReader.value) {
            await codeReader.value.reset();
            codeReader.value = null;
          }

          const reader = new BrowserMultiFormatReader();
          const hints = new Map([
            [DecodeHintType.POSSIBLE_FORMATS, [
              BarcodeFormat.QR_CODE,
              BarcodeFormat.EAN_13,
              BarcodeFormat.CODE_128,
              BarcodeFormat.DATA_MATRIX
            ]],
            [DecodeHintType.TRY_HARDER, true]
          ]);
          
          reader.hints = hints;
          codeReader.value = reader;
          return true;
        } catch (error) {
          console.error('Scanner initialization error:', error);
          return false;
        }
      };
      const startScanning = async () => {
        try {
          isLoading.value = true;
          scannerStatus.value = 'Initializing camera...';
          hasError.value = false;
          scanAttempts.value = 0;

          const initialized = await initializeScanner();
          if (!initialized) {
            throw new Error('Failed to initialize scanner');
          }

          if (!videoElement.value) {
            throw new Error('Video element not found');
          }

          await codeReader.value.decodeFromConstraints(
            videoConstraints,
            videoElement.value,
            (result, error) => {
              if (result) {
                const scannedValue = result.getText();
                handleSuccessfulScan(scannedValue);
              } else if (error && error.name !== 'NotFoundException') {
                handleScanError(error);
              }
            }
          );

          isLoading.value = false;
          scannerStatus.value = 'Position barcode in the frame';

        } catch (error) {
          console.error('Scanning error:', error);
          handleScanError(error);
        }
      };
      const stopScanning = async () => {
        try {
          isScanning.value = false;
          if (codeReader.value) {
            await codeReader.value.reset();
            codeReader.value = null;
          }
          await cleanup();
        } catch (error) {
          console.error('Error stopping scanner:', error);
        }
      };
      const toggleScanning = async () => {
        if (isScanning.value) {
          await stopScanning();
        } else {
          isScanning.value = true;
          await startScanning();
        }
      };
      const handleSuccessfulScan = (scannedValue) => {
        if (!scannedValue) return;
        
        console.log('Scanned value:', scannedValue);
        needle.value = scannedValue;
        new Audio('/src/assets/scanner-beep.mp3').play().catch(console.error);
        handleSearch();
        stopScanning();
      };
      const handleScanError = (error) => {
        console.error('Scan error:', error);
        hasError.value = true;
        
        if (error.name === 'NotAllowedError') {
          scannerStatus.value = 'Camera access denied';
          stopScanning();
        } else if (error.name === 'NotReadableError') {
          scannerStatus.value = 'Camera is in use by another application';
          stopScanning();
        } else {
          scannerStatus.value = 'Scanner error occurred';
        }
      };
      const cleanup = async () => {
        try {
          if (videoElement.value && videoElement.value.srcObject) {
            const tracks = videoElement.value.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoElement.value.srcObject = null;
          }
          
          isScanning.value = false;
          isLoading.value = false;
          hasError.value = false;
          scanAttempts.value = 0;
          scannerStatus.value = 'Scanner stopped';
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      };

      const getUserAvatar = (user) => {
          if (!user) return '/src/assets/avatarMale.png'
          if (user.localDp) return user.localDp
          return user.gender === 'female' 
              ? '/src/assets/avatarFemale.png' 
              : '/src/assets/avatarMale.png'
      }
      const handleLogout = () => {
        authStore.logout()
      }

      const handleSync = () => {
        offlineSyncStore.fetchUpdatedData('syncNow')
      }

      onBeforeMount(async () => {
        try {
          // Initialize stores in parallel
          await Promise.all([
            productsStore.ready(),
            holdInvoicesStore.ready(),
            openBalanceStore.ready(),
            offlineInvoicesStore.ready()
          ]);
        } catch (error) {
          console.error('Error initializing LocalForage stores:', error);
        }
      });
      onMounted(async () => {   
        await onlineStatusStore.initializeOnlineStatus()
        await offlineSyncStore.fetchAllStocksAndSave('fresh')
        // offlineSyncStore.syncOfflineInvoices('background')
        offlineSyncStore.fetchUpdatedStocks()
        offlineSyncStore.fetchUpdatedData()        
        authStore.loadUsers("logedIn")
        openingBalanceModal()
        fetchHeldInvoices()
        storeCustomers()
        storeTransferPOSAccounts()
        offlineSyncStore.startPeriodicFetch()
        try {
          codeReader.value = new BrowserMultiFormatReader()
        } catch (error) {
          console.error('Onmount Error:', error)
        }
      });

      onUnmounted(() => {
        if (isScanning.value) {
          stopScanning()
        }
        if (user.value && user.value.imageBlob) {
          URL.revokeObjectURL(user.value.localDp)
        }
        offlineSyncStore.stopPeriodicFetch()
      });

      return {
        handleLogout,
        getUserAvatar,

        clearHold,
        showpasswordModal,
        current_password,
        new_password,
        confirm_password,
        updatePassword,
        passwordModal,
        closepasswordModal,

        deposit,
        customersLoaded,
        depositWhichCustomer,
        depositTotalRcv,
        showDepositModal,
        closedepositModal,
        depositModal,
        depositCashRcv,
        depositPosRcv,
        depositPosBank,
        depositPosDesc,
        depositTransferRcv,
        depositTransferBank,
        depositTransferDesc,
        depositCusID,
        depositCusBalance,

        // delHoldItem,

        handleSync,

        showclosingBalanceModal,
        closeclosingBalanceModal,
        closingBalanceModal,
        CashClosed,
        POSClosed,
        TransferClosed,
        PettyExpClosed,
        ExpDescClosed,
        saveClosingBalance,

        onlineStatusStore,
        toggleScanning,
        videoElement,
        isScanning,
        isLoading,
        scannerStatus,
        hasError,
        startScanning,
        stopScanning,
        handleSearch, // Make sure this is defined in your component

        focusOnInputLoadData,
        offlineInvoicesCount,
        showopeningBalanceModal,
        openingBalance,
        saveOpeningBalance,
        printPaidInvoice,
        // processingPayment,
        isCustomer,
        inputBlur,
        clearInput,
        PayView,
        cashActive,
        creditActive,
        cashRcv,
        posRcv,
        transferRcv,
        creditRcv,
        totalRcv,
        posBank,
        totalDue,
        discount,
        posBank,
        posDesc,
        transferBank,
        transferDesc,
        toBeProcessed,
        totalChange,
        selectedCustomer,
        whichCustomer,
        maxLimit,
        cusLimit,
        cusBalance,
        cusDesc,
        processPayment,

        ngnFormatter,
        user,
        till,
        store,
        cart,
        total,
        needle,
        searchResults,
        handleSearch,
        addToCart,
        qtyKeyUp,
        increaseQuantity,
        decreaseQuantity,
        deleteItem,
        cartClear,
        showPaymentModal,
        openPaymentModal,
        closePaymentModal,
        invoicesHold,
        holdInvoice,
        handleInvoiceHeld,
      }
    }
  }
</script>

<style scoped>
.scanner-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scanner-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 640px;
  height: 480px;
  z-index: 1000;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* Mirror if needed */
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
}

.scanner-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: #ff0000;
  animation: scan 2s linear infinite;
}

.scanner-target {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px; /* Increased target area */
  height: 280px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.6);
  pointer-events: none;
}

.scanner-focus-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.scanner-target::before,
.scanner-target::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #00ff00;
  border-style: solid;
}

.scanner-target::before {
  top: -2px;
  left: -2px;
  border-width: 2px 0 0 2px;
}

.scanner-target::after {
  bottom: -2px;
  right: -2px;
  border-width: 0 2px 2px 0;
}

@keyframes scan {
  0% {
    top: 0;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .scanner-container {
    max-width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .scanner-target {
    width: 150px;
    height: 150px;
  }
}

/* Button styles */
.btn-outline-secondary {
  transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  color: white;
}

.btn-outline-secondary.scanning {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-outline-secondary.scanning:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

/* Loading indicator */
.scanner-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.2em;
  text-align: center;
  z-index: 1001;
}

.scanner-loading::after {
  content: '';
  display: block;
  width: 40px;
  height: 40px;
  margin: 10px auto;
  border: 4px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Close button */
.scanner-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
  z-index: 1002;
}

.scanner-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Status message */
.scanner-status {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9em;
  z-index: 1002;
}

.header-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title h4 {
  margin: 0; /* Remove default margin to ensure proper alignment */
}

/* .header-title span {
  margin-left: auto; Push the span to the right
} */

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin-right: auto;
}



.till-container {
  height: calc(95vh - 60px);
  overflow: hidden;
  background-color: #f5f5f7; /*  8888a1*/
  padding: 15px;
}

.card {
  border-radius: 15px;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.card-header {
  background-color: #ffffff;
  /* background-color: #f8f9fa;*/
  border-bottom: 1px solid #e9ecef; 
  font-weight: bold;
}
.card-body {
  position: relative;
}

.btnRoundR {
  border-radius: 0 15px 15px 0;
}
.btnRoundL {
  border-radius: 15px 0 0 15px;
}
.form-control {
  border-radius: 20px;
}
.material-icons {
  vertical-align: middle;
}

.search-results-overlay {
  position: absolute;
  top: 100%; /* Position it right below the search input */
  left: 0;
  right: 0;
  max-height: 600px;
  overflow-y: auto;
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* High z-index to appear on top */
}

.search-result-item {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

div.rtl-tbl {
  display: table;
  width: 100%;
}
ul.sales-tab.header {
  background-color: #f8f9fa;
  font-weight: bold;
}
ul.sales-tab.header li {
  border-top: 1px solid #eee;
}
ul.sales-tab {
  display: table-row;
  width: 100%;
  list-style: none;
  margin: 0px;
  color: rgb(10, 0, 0);
  font-size: 15px;
}
ul.sales-tab > li {
  display: table-cell;
  width: auto;
  padding: 10px 10px;
  border-right: 1px dashed #eee;
  border-bottom: 1px solid #eee;
  vertical-align: top;
  background-color: #ffffff;
  transition: background-color 0.2s;
}
ul.sales-tab:hover {
  background-color: #f8f9fa;
}
ul.sales-tab > li.sno {
  width: 50px;
  border-left: 1px solid #eee;
}

ul.sales-tab > li.product {
  width: auto;
  text-transform: capitalize;
}
ul.sales-tab > li.qty {
  width: 140px;
  text-align: right;
}
ul.sales-tab > li.sub {
  width: 120px;
  text-align: right;
}
ul.sales-tab > li.remove {
  width: 50px;
  text-align: right;
  border-right: 1px solid #eee;
}
li.qty input.qty {
  padding: 3px;
  text-align: center;
  min-width: 40px;
}
div.cart-item {
  display: table;
  width: 100%;
}
.cart-list {
  border-radius: 10px;
  overflow: hidden;
}
div.cart-list.main {
  /* height: calc(98vh - 290px); */
  height: calc(93vh - 290px);
  min-height: 100px;
  overflow-y: scroll;
  border: 1px solid #eee;
  border-right: none;
  margin-top: 1px;
  padding-bottom: 1px;
}
div.cart-list.main ul.sales-tab > li:nth-child(1) {
  border-left: 0px;
}
div.cart-list.main ul.sales-tab > li:nth-child(6) {
  border-right: 0px;
}
input, select {
    width:100%;
    border:1px solid #CCC;
    border-radius:10px;
    padding:3px 10px;
    /* margin-bottom:5px; */
    text-align:center;
    font-family: "Arimo", sans-serif;
    font-size:18px;
    font-weight:bold;
  }
  textarea{
    min-height: 100px;
    height: 40px;
    border: 1px solid #CCC;
    border-radius: 15px;
    text-align: left;
    padding: 10px;
    font-size:16px;
  }
			/* input#productInput{
				margin-top:10px;
				text-transform:capitalize;
				font-weight:bold;
				color:#C33;
				padding-right:30px;
			}	 */
			
			ul#paymentNav{
				float:left;
				position:relative;
				list-style:none;
				padding:0px;
				margin:0px;
				width:100%;
			}
			
			ul#paymentNav > li{
				z-index:5;
				float:left;
				width:50%;
				height:50px;
				padding:5px 10px;
				text-align:center;
				font-size:14px;
				cursor:pointer;
				border:1px solid transparent;
				border-bottom-color:#CCC;
				overflow:hidden;
			}

			ul#paymentNav > li .amt{
				font-size:13px;
			}
			
			ul#paymentNav li:hover, ul#paymentNav li.active{
				background-color:#EAEAFA;
				border-color:#CCC;
			}
			
			ul#paymentNav > li.active{
				font-weight:bold;
				border-bottom:none;
			}
			
			ul#paymentNav > li > div.content{
				display:none;
				position:absolute;
				top:50px;
				left:0px;
				z-index:0;
				padding:30px;
				width:100%;
				height:calc(100vh - 425px);
				min-height:200px;
				overflow-y:auto;
				border:1px solid #CCC;
				border-top:0px;
				background-color:#EAEAFA;
			}
			ul#paymentNav > li.active > div.content{
				display:block;
			}
			
			div#paymentModal .modal-body{
				height:calc(100vh - 340px);
				min-height:285px;
			}
			
			ul#details{
				display:table;
				width:100%;
				list-style:none;
				margin:0px;
				padding:0px;
			}
			
			ul#details > li{
				display:table-cell;
				width:33.33%;
				padding:5px;
			}
			
			#paymentModal input{
				width:100%;
				text-align:center;
				border:1px solid #CCC;
				padding:5px;
				font-weight:bold;
			}
			
			div#paymentModal .modal-body input{
				margin-top:10px;
			}

			div#paymentModal .modal-footer input{
				background-color:#EAEAFA;
			}

			#paymentModal .label{
				text-align:center;
				font-size:12px;
				color:#333;
				margin-top:5px;
			}
      div#depositModal .modal-body{
				height:calc(100vh - 340px);
				min-height:285px;
			}
			
			/* ul#details{
				display:table;
				width:100%;
				list-style:none;
				margin:0px;
				padding:0px;
			}
			
			ul#details > li{
				display:table-cell;
				width:33.33%;
				padding:5px;
			} */
			
			#depositModal input{
				width:100%;
				text-align:center;
				border:1px solid #CCC;
				padding:5px;
				font-weight:bold;
			}
			
			div#depositModal .modal-body input{
				margin-top:10px;
			}

			div#depositModal .modal-footer input{
				background-color:#EAEAFA;
			}

			#depositModal .label{
				text-align:center;
				font-size:12px;
				color:#333;
				margin-top:5px;
			}
			
</style>
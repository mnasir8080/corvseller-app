<!-- src/components/SelectStore.vue -->
  <template>
      <div class="container h-100">
        <div class="row justify-content-center align-items-center h-100">
          <div class="col-md-6">
              <div class="" id="tillsDiv">
                <div class="card mx-auto mb-3">
                  <div class="card-body text-center">
                    <div class="p-3">
                      <img id="dp" class="img-fluid" style="background-image:url(../src/assets/avatarMale.png);"/>
                      <!-- {{ user }} -->
                      <div id="user-badge" class="mt-2">{{user.title}} {{user.name}}</div>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-body">
                    <div id="loading"></div>
                      <div id="tills" class="p-3" style="height: 500px; overflow-y: auto;">
                      <h4 class="text-center fw-bold mb-4">Select Store</h4>
                      <div v-for="(till, i) in tills" :key="i" class="till-list">
                        <a>
                          <div class="row till-info">
                            <div class="col-12">
                              <h3>Till Code: {{ till.code }}</h3>
                            </div>
                            <div class="row">
                              <div class="col-6">
                                <template v-if="till.assigned == 0">Un-Assign</template>
                                <template v-if="till.assigned == 1">Assigned</template><br/>
                                <small class="text-muted">
                                    Status
                                </small>
                              </div>
                              <div class="col-6">
                                {{ till.days }} 
                                <br/>
                                <small class="text-muted">
                                    Day(s)
                                </small>
                              </div>
                            </div>
                            <template v-if="till.billing == 'active'">
                              <button class="btn btn-success btn-block" :disabled="isLoading" v-if="till.assigned == 0" @click="activateTill(till.id)">
                                <template v-if="isLoading">
                                  <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                  <span role="status">Registering...</span>
                                </template>
                                <template v-else>
                                    Register
                                </template>
                              </button>
                              <button class="btn btn-primary btn-block" :disabled="isLoading" v-if="till.assigned == 1" @click="activateTill(till.id)">
                                <template v-if="isLoading">
                                  <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                  <span role="status">Re-Assigning...</span>
                                </template>
                                <template v-else>
                                    Re-Assign
                                </template>
                              </button>
                            </template>
                            <template v-else>
                              <button class="btn btn-danger btn-block" disabled> Expired </button>
                            </template>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div> 
            </div>
        </div>
      </div>
  </template>
  <script>
  import { ref, computed } from 'vue'
  import { useAuthStore } from '../stores/auth'
  // import { jwtDecode } from 'jwt-decode';
  export default {
    name: 'SelectStore',
    setup() {
      const authStore = useAuthStore()
      const user = computed(() => authStore.getUser)
      const isLoading = ref(false)
      // const tills = ref(null)
      const tills = computed(() => authStore.getTills)
      // const gettillsD = async () => {
      //   tills.value = authStore.getTills;
      // }
      
      const activateTill = async (id) => {
        const tillD = tills.value.filter(item => item.id === id);
        // console.log(id, tillD[0].id)
        if (tillD[0]) {
          await authStore.fetchTillData(tillD[0].id)
        } else {
          console.error('Till Data Not FOund');
        }
      }
      // gettillsD()
      return {
        user,
        isLoading,
        tills,
        // gettillsD,
        activateTill
      }
    }
  }
  </script>
  <style scoped>
  /* Global Styles */
  * {
    font-family: 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 16px;
    color: #333;
    box-sizing: border-box;
  }

  /* Profile Section */
  img#dp {
    width: 80px;
    height: 80px;
    border: 1px solid #DDD;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 10px;
    background-color: #F5F5FF;
    background-image: url(/assets/images/user.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: 80px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  div#user-badge {
    color: #555;
    font-size: 18px;
    padding: 5px 10px;
    border: 1px solid #DDD;
    border-radius: 25px;
    background-color: #F5F5FF;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  .till-list {
    margin-bottom: 15px;
    padding: 15px 15px 0 15px;
    border: 1px solid #DDD;
    border-radius: 20px 20px 0 0;
    background-color: #F7F7F7;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s ease;
  }

  .till-list:hover {
    background-color: #F0F0F0;
  }

  .till-info h4 {
    margin-bottom: 5px;
    font-weight: 600;
  }

  .till-info small {
    font-size: 14px;
    color: #666;
  }

  div#tills a {
    cursor: pointer;
    background-color: #F5F5FF;
    border-radius: 15px;
    text-decoration: none;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s ease;
  }

  div#tills a:hover {
    background-color: #F0F0FF;
  }
  .card {
    border: none;
    border-radius: 20px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }

  .card-body {
    padding: 10px;
  }

  h4 {
    font-weight: 600;
    margin-bottom: 10px;
  }
</style>
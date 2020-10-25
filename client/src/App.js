import axios from 'axios';
import logo from './logo.png';
import './App.css';
import {Component} from 'react';
import {Grid, Container, Image, Divider} from 'semantic-ui-react'
import InputForm from './components/InputForm'
import Results from './components/Results'

class App extends Component {
  constructor(){
    super()
    this.spoonKey = "f47145e1238d4cb89bf99a85fe1d18ab";
    this.state = {
      recipeIds: [],
      recipes: []
    }
  }

  idsCallback = (response) => {
    let recipes = response.data.results;
    this.setState(prevState => ({
      ...prevState, recipeIds: recipes.map(obj => obj.id)}), 
      () => this.getRecipesPrimaryData());
  }

  primaryDataCallback = (response) => {
    var recipes = []
    let recipeData = response.data;
    recipeData.forEach(recipe_data => {
      let recipe = {};
      recipe.id = recipe_data.id;
      recipe.name = recipe_data.title;
      recipe.image = recipe_data.image;
      recipe.sourceUrl = recipe_data.sourceUrl;
      recipe.steps = []
      var ingredients = [];
      recipe_data.extendedIngredients.forEach(ingredient => {
        ingredients.push(ingredient.original);
      });
      recipe.ingredients = ingredients;
      recipes.push(recipe)
    })
    this.setState(prevState => ({
      ...prevState,
      recipes: recipes
    }), () => console.log(this.state))
  }

  secondaryDataCallback = (response, recipes, index) => {
    let instructions_data = response.data
    let recipe = recipes[index];
    console.log(instructions_data)
    if(!instructions_data){
      recipe.steps = []
    } else {
      var steps = [];
      instructions_data.forEach(instruction => {
        steps.push(instruction.step);
      })
      recipe.steps = steps;
    }
    recipes[index] = recipe
    this.setState(prevState => ({
      ...prevState,
      recipes: recipes 
    }));           
  }

  getRecipeIds = () => {
    axios.get('https://api.spoonacular.com/recipes/complexSearch?&number=9&apiKey=' + this.spoonKey)
        .then(this.idsCallback)
        .catch(function (error) {
            console.log(error);
        });
  }

  getRecipesPrimaryData = () => {
    let bulkRequest = "https://api.spoonacular.com/recipes/informationBulk?ids=";
    const recipeIds = this.state.recipeIds;
    recipeIds.forEach(id => {
      bulkRequest += id + "," 
    })
    bulkRequest += '&apiKey=' + this.spoonKey;
    axios.get(bulkRequest)
      .then(this.primaryDataCallback)
      .catch(function (error) {
        console.log(error);
      });
  }

  getRecipesSecondaryData = () => {
    var recipes = this.state.recipes;
    recipes.forEach((recipe, index) => {
      axios.get("https://api.spoonacular.com/recipes/" + recipe.id + "/analyzedInstructions?&apiKey=" + this.spoonKey)
        .then(response => this.secondaryDataCallback(response, recipes, index))
        .catch(function (error) {
          console.log(error);
        });
    })
  }

  onFormChange = (state) => {
    this.setState(prevState => ({
      ...prevState,
      formState: state
    }));
  }

  onFormSubmit = () => {
    this.getRecipeIds();
    setTimeout(this.getRecipesSecondaryData, 2000);
  }

  getContainerDimensions = () => {
    if (this.container){
      return this.container.getBoundingClientRect();
    } 
  }

  render(){
    return(
      <Container style={{width: "80%", height: "100%"}}>
        <Image size="small" centered src={logo}></Image>
        <Divider horizontal/>
        <Grid columns={2} divided>
          <Grid.Column>
            <InputForm onFormSubmit={this.onFormSubmit} onFormChange={this.onFormChange}/>
          </Grid.Column>
          <Grid.Column>
            <div ref={el => this.container = el} style={{overflowY: 'auto', overflowX: 'hidden', maxHeight: 700}}>
              <Results meals={this.state.recipes} getDims={this.getContainerDimensions}/>
            </div>
          </Grid.Column>
        </Grid>
      </Container>
    );
  }

}


var ingredientList = [""];
var productId;
const krogerGet = 'https://sheltered-fortress-21023.herokuapp.com/' + "https://api.kroger.com/v1/products?filter.term="
const krogerKey = "&access_token=eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYXBpLmtyb2dlci5jb20vdjEvLndlbGwta25vd24vandrcy5qc29uIiwia2lkIjoiWjRGZDNtc2tJSDg4aXJ0N0xCNWM2Zz09IiwidHlwIjoiSldUIn0.eyJhdWQiOiJyZWNpcGVzLTk1MzM1OWQ0MmVjYjQwNzc1Mzg1OGRhNDM5MTUzODg2ODU4NTI5MzUyOTI0MDAwMDE4MiIsImV4cCI6MTYwMzU5Nzg5MCwiaWF0IjoxNjAzNTk2MDg1LCJpc3MiOiJhcGkua3JvZ2VyLmNvbSIsInN1YiI6ImU2ZDdmNjVkLWJjMjAtNTkzMi05NjNlLTRlNDQyOWM0NzBiMSIsInNjb3BlIjoicHJvZHVjdC5jb21wYWN0IiwiYXV0aEF0IjoxNjAzNTk2MDkwOTM1NjE0MTI2LCJwZmN4IjoidXJuOmtyb2dlcmNvOnByb2ZpbGU6c2hvcHBlcjoxOTczNDBkNy0wYTQ1LTQzY2ItOTA3ZS04NDQ1ZDgyODk0ODEiLCJhenAiOiJyZWNpcGVzLTk1MzM1OWQ0MmVjYjQwNzc1Mzg1OGRhNDM5MTUzODg2ODU4NTI5MzUyOTI0MDAwMDE4MiJ9.J5poynhvUhVxSTuLccOWdl3Qv9ygUFaQYbc0VF74Us_qNUyPG661i5ORGIRaTq-4GDGR3PvoJrtjuyBhjjTDpZWrCVUVlnTG0mZBXkdfF80jhSC9Eu2m_xngbiiCxQ2VSrwls3YMgluCfQIosG00__1S1vrZsqOCa6C_xKjMeAq5SDCXKXeKLlRiFjvFyxU4IexQPFoxT1rKyLt_pQhvZxL1g0Ul1HVAVhekriGjBs-kCxJrVpM9sBEO9UXjI-O6pU0ebzk6pRwy3-rsYlIgFYO-rjbdCZ3dsdOrlOtHiF4CJQDBd43VWJFL1qYCMrtS-8bb1gmAytMwm_2DiQGJ_A";

//Prints ingredients from getIngredients()
// Does kroger API call 
function pushIngredients() {
  ingredientList.forEach(element => {
      axios.get(krogerGet + element + krogerKey)
      .then(function (response) {
          productId = response.data.data[0].productId;
          var krogerData = JSON.stringify({"items":[{"quantity":1,"upc":productId}]});
          var krogerPutConfig = {
          method: 'put',
          url: 'https://sheltered-fortress-21023.herokuapp.com/' + 'https://api.kroger.com/v1/cart/add',
          headers: { 
              'Content-Type': 'application/json', 
              'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYXBpLmtyb2dlci5jb20vdjEvLndlbGwta25vd24vandrcy5qc29uIiwia2lkIjoiWjRGZDNtc2tJSDg4aXJ0N0xCNWM2Zz09IiwidHlwIjoiSldUIn0.eyJhdWQiOiJyZWNpcGVzLTk1MzM1OWQ0MmVjYjQwNzc1Mzg1OGRhNDM5MTUzODg2ODU4NTI5MzUyOTI0MDAwMDE4MiIsImV4cCI6MTYwMzU5NzI0NywiaWF0IjoxNjAzNTk1NDQyLCJpc3MiOiJhcGkua3JvZ2VyLmNvbSIsInN1YiI6ImU2ZDdmNjVkLWJjMjAtNTkzMi05NjNlLTRlNDQyOWM0NzBiMSIsInNjb3BlIjoiY2FydC5iYXNpYzp3cml0ZSIsImF1dGhBdCI6MTYwMzU5NTQ0NzIwOTAwMDM4NCwicGZjeCI6InVybjprcm9nZXJjbzpwcm9maWxlOnNob3BwZXI6MTk3MzQwZDctMGE0NS00M2NiLTkwN2UtODQ0NWQ4Mjg5NDgxIiwiYXpwIjoicmVjaXBlcy05NTMzNTlkNDJlY2I0MDc3NTM4NThkYTQzOTE1Mzg4Njg1ODUyOTM1MjkyNDAwMDAxODIifQ.HgHz-GNAcz9rO4T-O5U51zlvjKcA7ITzoIDqXtkI4yy4GOkZxmboYh903Xosnu1NMeiA_ne-DhgAyBI3_86CJzoyvqMDZAIK0YAJNdjGU5HmnAR6hu6VnvXNS8vU5-42ky63yobs5vBL6uq2m71Gcupvx0BgUWO4Tdf-f5L6nlt0Z2_PeDw4uCD9BnI8ocdZsAAERtL3KZdiQ0eTyhqpYQv3lFuvBlMxYGgUy6-0tAJtN6bllG89wSZ1NerXYmVGxcATKpEXizDNRr_vdDTMvYPRFiGJlCgQZjaOBqlTdvrPzt9BcwT4gWFha-JbcdAiv1YxLsTQGyAfCenkOzoKfA', 
              'Cookie': '_gcl_au=1.1.2006088855.1603575799; origin=fldc; rxVisitor=1603575845111TT5N6IV68MGRL1B5MC4MI3P8CH0ICPNU; DivisionID=025; StoreCode=00613; _pin_unauth=dWlkPU5qRm1NR1JqWW1JdE5EZ3lZaTAwTVRCakxUbGpaamd0WWpReE1USTJOR1UzT1RjNQ; RT="z=1&dm=kroger.com&si=gp9z3jo8j6b&ss=kgo7nl1g&sl=1&tt=0&nu=9da7d33a729e95e92719ecd580697b07&cl=pja&obo=1&ld=qys&r=9da7d33a729e95e92719ecd580697b07&ul=qyu&hd=rhb"; akaalb_Digital_ALB_API=~op=KT_Digital_API_KCVG_F5:api-kcvg|KT_Digital_API_Apigee:api-apigee|~rv=37~m=api-kcvg:0|api-apigee:0|~os=75b4a9ec926d2a9e67035451773cec6c~id=91501d3e41a0b7dcff31146f9a95ee0f; s_ips=578; AMCVS_371C27E253DB0F910A490D4E%40AdobeOrg=1; s_cc=true; bm_sz=E5EF5A9A2AFF595879C3C8AF26FFC723~YAAQTqQ2FzcDWFd1AQAA5rFWXQlhLiA+WKc6ySuRccSX2f81xdsR/kkchsW2bWV6ujWAluwD/ijYLgAxMfvj8teHskR9JfbX3c2vkHaalJp2UgqtjKtPEGKNS6Xg1wpHeLnNeQ5Fe2+tA/zgXDDo7p7Ww2tyeUJ7y69phXO6wE3wY5217TMne/6ch62+7ekY; AMCV_371C27E253DB0F910A490D4E%40AdobeOrg=-432600572%7CMCIDTS%7C18560%7CMCMID%7C36280152519877809193001074290303296431%7CMCAAMLH-1604200128%7C7%7CMCAAMB-1604200128%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1603602528s%7CNONE%7CMCAID%7CNONE%7CMCSYNCSOP%7C411-18567%7CvVersion%7C4.5.2; s_id=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWRpcmVjdF91cmkiOiJodHRwOi8vMTI3LjAuMC4xOjU1MDAvaW5kZXguaHRtbCIsInNjb3BlIjoiY2FydC5iYXNpYzp3cml0ZSIsImF1ZCI6InJlY2lwZXMtOTUzMzU5ZDQyZWNiNDA3NzUzODU4ZGE0MzkxNTM4ODY4NTg1MjkzNTI5MjQwMDAwMTgyIiwiZXhwIjoxNjAzNTk2MDM5LCJpc3MiOiJLcm9nZXIiLCJzdWIiOiIxNmE2YzA3YS0xN2JkLTRjZjUtYmExMi04ZmU2ZGJjMTdlNDIifQ.3oKxChsJZx0lAxxDj24HhMpkPPw92PLDUd0QyTVcMNg; pid=16a6c07a-17bd-4cf5-ba12-8fe6dbc17e42; s_tslv=1603595440090; _uetsid=ee2040f0164111ebbb72f399747a8f42; _uetvid=ee205d00164111eb9fafe9bb46652adc; s_tp=1172; s_ppv=bn%253Av1%253Aconnect%253Asignin%2C49%2C49%2C578%2C1%2C2; s_sq=krgrmobileprod%3D%2526c.%2526a.%2526activitymap.%2526page%253Dbn%25253Av1%25253Aconnect%25253Asignin%2526link%253DSign%252520In%2526region%253Dsignin_form%2526pageIDType%253D1%2526.activitymap%2526.a%2526.c%2526pid%253Dbn%25253Av1%25253Aconnect%25253Asignin%2526pidt%253D1%2526oid%253DSign%252520In%2526oidt%253D3%2526ot%253DSUBMIT; umid=86c5f2d1-5d43-450b-81c6-46934e25b8f5; j_id=; _abck=138A8FB4A14A4FFFD0318F8C46124B27~-1~YAAQZ6Q2F7xzait1AQAAab28XQTnqh8ebYc8AvSXkfUOH5B94dW09wirGXLLr52SCjIJ2OknGUU7etqc7nJGJmNmswTZ2/fWdL8a+J/LDbeJnha7vv2GAu6eJJSdgmU0blLNxoM8gPtnpwaalfzwnlkopMDEouetCzbXZ8rLPcc9bBPrZhfEiYI0+ZoJvgVL2rCWBlemWXCL912rpEc4oAGg78n/iGZze3baE3Ff1Z/zE8QGaVILQLUtmoLUc2hi3uPsHFUi5cH9hDo5tnH/IQy+yyto6abUZxpfd+PpTejkuOQ4n3AsUvsZcywvWvr9E7BMmdXX1o4ZYnRGbvKi8rj4/ds=~0~-1~-1'
          },
          krogerData : krogerData
          };
          axios(krogerPutConfig)
              .then(function (response) {console.log(JSON.stringify(response.data));})
              .catch(function (error) {console.log(error);});
      })
      .catch(function (error) {
          console.log(error);
      });
  });
}







export default App;

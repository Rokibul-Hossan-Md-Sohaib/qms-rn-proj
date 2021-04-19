import React, { Component } from 'react'
import { View, Text, StatusBar, Pressable, Dimensions, StyleSheet, Modal, TouchableOpacity, Button } from 'react-native';
import moment from 'moment'
import Toast from 'react-native-toast-message';
import {
  writeProductionToLocalDB, 
  writeReworkedToLocalDB, 
  writeRejectToLocalDB, 
  writeDefectToLocalDB
} from '../db/dbServices/__LDB_Count_Services'
import {    
  getCurrentHourId,
  getTodaysTotalFttCount,
  getTodaysTotalDefectCount,
  getUniqueAttributes,
  getTodaysTotalRejectCount,
  getTodaysTotalReworkCount,
  getCurrentLoggedInUserForToday,
  getAllDefects,
  getCurrentHourExistingData
} from '../db/dbServices/__LDB_Count_Utilities'
import * as constKVP from '../utils/constKVP'
import {moderateScale} from 'react-native-size-matters'
import Orientation from 'react-native-orientation';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProp } from 'react-navigation';
let dateObj: Date = new Date();


type Props = {
  navigation: NavigationScreenProp<any,any>
};

type State = {
  today: string,
  totalDayFttCount: number,
  totalDayDefectCount: number,
  totalDayRejectCount:number,
  totalDayReworkedCount:number,

  fttCount: number,
  defectCount: number,
  rejectCount: number,
  reworkedCount: number,

  incrementBy: number,
  screenWidth: number,
  screenHeight: number,
  modalVisible: boolean,

  shwoNextButton:boolean,
  showStyleImage:boolean,
  modeCode: number,
  modeColor: string,

  allDefects: any[],
  defectCategories:any[],
  filteredDefects:any[],
  selectedDefectObj:any,
  selectedDefectCategory: any,
  selectedDefectHeadId: any,

  currentProdObj:any,
  currentHourObj:any,
  current_login:any,
  currentCountObj:any,

  currentHour: any,
  isSynced: boolean,
};



class ProductionCountSizeWise extends React.Component<Props, State> {

    state: State ={
      today: moment().format('YYYY-MM-DD'),
      totalDayFttCount: 0,
      totalDayDefectCount: 0,
      totalDayRejectCount:0,
      totalDayReworkedCount:0,

      fttCount: 0,
      defectCount: 0,
      rejectCount: 0,
      reworkedCount: 0,

      incrementBy: 1,
      screenWidth: 0,
      screenHeight: 0,
      modalVisible: false,

      shwoNextButton:false,
      showStyleImage:false,
      modeCode: -1,
      modeColor: "#3d9efd",

      allDefects:[],
      defectCategories:[],
      filteredDefects:[],
      selectedDefectObj:null,
      selectedDefectCategory: null,
      selectedDefectHeadId: null,

      currentProdObj:{},
      currentHourObj:{},
      current_login:{},
      currentCountObj:{},

      currentHour: null,
      isSynced: false,
    }

//moment(new Date()).format("hh:00A");
    constructor(props: Props) {
      super(props);
      this.props.navigation.addListener(
        'didFocus',
        payload => {
          Orientation.lockToLandscapeLeft();
        });
    }

    countFtt(){
      //vHourId: this.getCurrentHourId(),
      //get Previous hour check if new hour equels to state hour
      var thisHourID: any = getCurrentHourId();
      //console.log('Now',thisHourID)

      if(thisHourID === undefined){
        Toast.show({
          type: "error",
          position: 'top',
          text1: "Alert!",
          text2: "This is not the production Hour!, Try After sometimes.",
          visibilityTime: 1500,
          })
      }else{

            var {
              iAutoId, vDeviceId, dEntryDate, vProductionPlanId, vUnitLineId, vHourId, vBuyerId, vStyleId, vColorId, vSizeId,
              vBuyerName, vSizeName, vExpPoorderNo, vColorName, vStyleName, dShipmentDate,
              dDateOfProduction, dStartTimeOfProduction, dEndTimeOfProduction,iProductionQty,
              iTarget, vProTypeId, nHour, iManPower, vPreparedBy, vShiftId
            } = this.state.currentCountObj;

          if(thisHourID["vHourId"] === this.state.currentCountObj.vHourId){    
            
            //This is running hour...
            this.setState(() => ({
              fttCount: this.state.fttCount + 1, //hour based counter
              currentCountObj: { 
                    iAutoId, vDeviceId, dEntryDate, vProductionPlanId, vUnitLineId, vHourId, 
                    vBuyerName, vSizeName, vExpPoorderNo, vColorName, vStyleName, dShipmentDate, vBuyerId, vStyleId, vColorId, vSizeId,
                    dDateOfProduction, dStartTimeOfProduction, dEndTimeOfProduction,
                    iTarget, vProTypeId, nHour, iManPower, vPreparedBy, vShiftId, 
                    iProductionQty: iProductionQty + 1, dLastUpdated: dateObj 
                    },
              totalDayFttCount: this.state.totalDayFttCount + 1, //independent of hour
              currentHour: thisHourID["vHourId"]
            }),()=>{
              //console.log('Production count write to db....', this.state.currentCountObj)
                writeProductionToLocalDB(this.state.currentCountObj);
            });

        }else{
          //New Hour detected, So this will reset hourCounter but main counter will go on...
          // And will create a new db entry with NEW hour ID
          this.setState(() => ({
            fttCount: 1,
            currentCountObj: { 
              iAutoId: 0, vDeviceId, dEntryDate, vProductionPlanId, vUnitLineId, vHourId: thisHourID["vHourId"],
              vBuyerName, vSizeName, vExpPoorderNo, vColorName, vStyleName, dShipmentDate, vBuyerId, vStyleId, vColorId, vSizeId,
              dDateOfProduction, dStartTimeOfProduction, dEndTimeOfProduction,
              iTarget, vProTypeId, nHour, iManPower, vPreparedBy, vShiftId, 
              iProductionQty: 1, dLastUpdated: dateObj 
              },
            totalDayFttCount: this.state.totalDayFttCount + 1,
            currentHour: thisHourID["vHourId"]
          }),()=>{
            //console.log('Production count write to db....', this.state.currentCountObj.iProductionQty)
            Toast.show({
              type: "info",
              position: 'bottom',
              text1: "Info !",
              text2: "New Hour Detected! "+thisHourID["vHourId"],
              visibilityTime: 1500,
              });
                writeProductionToLocalDB(this.state.currentCountObj);
          });
        }
      }

    }

    countDefect(){

      this.setState((prevState, props) => ({
        defectCount: prevState.defectCount + 1,
        totalDayDefectCount: prevState.totalDayDefectCount+1
      }), ()=>{
          //console.log('count defect')
          
        /**
         *                       vBuyerId:  reqObj.vBuyerId,
                      vBuyerName: reqObj.vBuyerName,
                
                      vStyleId:  reqObj.vStyleId,
                      vStyleName: reqObj.vStyleName,
                
                      vExpPoorderNo:  reqObj.vExpPoorderNo,
                
                      vColorId:  reqObj.vColorId,
                      vColorName: reqObj.vColorName,
                
                      vSizeId:  reqObj.vSizeId,
                      vSizeName: reqObj.vSizeName,
         */
        var currentDefectCountObj =
          {
            iAutoId: 0,
            vDeviceId: this.state.current_login.vDeviceId,
            dDateOfProduction: this.state.current_login.dLoginDateTime,                      
            vProductionPlanId: this.state.currentProdObj.vProductionPlanId,
            vUnitLineId: this.state.current_login.vUnitLineId,

            vBuyerId: this.state.currentProdObj.vBuyerId,
            vBuyerName: this.state.currentProdObj.vBuyerName,

            vStyleId:  this.state.currentProdObj.vStyleId,
            vStyleName: this.state.currentProdObj.vStyleName,
      
            vExpPoorderNo:  this.state.currentProdObj.vExpPoorderNo,
      
            vColorId:  this.state.currentProdObj.vColorId,
            vColorName: this.state.currentProdObj.vColorName,
      
            vSizeId:  this.state.currentProdObj.vSizeId,
            vSizeName: this.state.currentProdObj.vSizeName,

            vDefectCategoryId: this.state.selectedDefectObj.vDefectCategoryId,
            vDefectCategoryName: this.state.selectedDefectObj.vDefectCategoryName,
            vDefectHeadId: this.state.selectedDefectObj.vHeadId,
            vDefectHeadName: this.state.selectedDefectObj.vHeadName,
            vDefectCode: this.state.selectedDefectObj.code,
            iDefectCount: 1,
            dLastUpdated: dateObj
        };

        //console.log(currentDefectCountObj);
        writeDefectToLocalDB(currentDefectCountObj);
        /***TODO: Show Total Defects on Count, save on local db As individual Defect category */
        /***TODO: Save Defect Count Data to Local DB, And should be updated any existing defect data with production plan id, dDateOf Prod, vULID, Defect Code */
        this.setModalVisible(constKVP.__MODAL_FOR_DEFECT);
      });
    }
    
    countreject(){
      
      this.setState((prevState, props) => ({
        rejectCount: prevState.rejectCount + 1,
        totalDayRejectCount: prevState.totalDayRejectCount+1
      }), ()=>{
          //console.log('count defect')
         var currentRejectCountObj =
          {
            iAutoId: 0,
            vDeviceId: this.state.current_login.vDeviceId,
            dDateOfProduction: this.state.current_login.dLoginDateTime,                      
            vProductionPlanId: this.state.currentProdObj.vProductionPlanId,
            vUnitLineId: this.state.current_login.vUnitLineId,

            vBuyerId: this.state.currentProdObj.vBuyerId,
            vBuyerName: this.state.currentProdObj.vBuyerName,

            vStyleId:  this.state.currentProdObj.vStyleId,
            vStyleName: this.state.currentProdObj.vStyleName,
      
            vExpPoorderNo:  this.state.currentProdObj.vExpPoorderNo,
      
            vColorId:  this.state.currentProdObj.vColorId,
            vColorName: this.state.currentProdObj.vColorName,
      
            vSizeId:  this.state.currentProdObj.vSizeId,
            vSizeName: this.state.currentProdObj.vSizeName,

            vDefectCategoryId: this.state.selectedDefectObj.vDefectCategoryId,
            vDefectCategoryName: this.state.selectedDefectObj.vDefectCategoryName,
            vDefectHeadId: this.state.selectedDefectObj.vHeadId,
            vDefectHeadName: this.state.selectedDefectObj.vHeadName,
            vDefectCode: this.state.selectedDefectObj.code,
            iRejectCount: 1,
            dLastUpdated: dateObj
        };

        //console.log(currentRejectCountObj);
        writeRejectToLocalDB(currentRejectCountObj);
        /***TODO: Show Total Defects on Count, save on local db As individual Defect category */
        /***TODO: Save Defect Count Data to Local DB, And should be updated any existing defect data with production plan id, dDateOf Prod, vULID, Defect Code */
        this.setModalVisible(constKVP.__MODAL_FOR_REJECT);
      });

    }

    countreworked(){

      this.setState((prevState, props) => ({
        reworkedCount: prevState.reworkedCount + 1,
        totalDayReworkedCount: prevState.totalDayReworkedCount+1
      }), ()=>{
          //console.log('count defect')
         var currentReworkedCountObj =
          {
            iAutoId: 0,
            vDeviceId: this.state.current_login.vDeviceId,
            dDateOfProduction: this.state.current_login.dLoginDateTime,                      
            vProductionPlanId: this.state.currentProdObj.vProductionPlanId,
            vUnitLineId: this.state.current_login.vUnitLineId,

            vBuyerId: this.state.currentProdObj.vBuyerId,
            vBuyerName: this.state.currentProdObj.vBuyerName,

            vStyleId:  this.state.currentProdObj.vStyleId,
            vStyleName: this.state.currentProdObj.vStyleName,
      
            vExpPoorderNo:  this.state.currentProdObj.vExpPoorderNo,
      
            vColorId:  this.state.currentProdObj.vColorId,
            vColorName: this.state.currentProdObj.vColorName,
      
            vSizeId:  this.state.currentProdObj.vSizeId,
            vSizeName: this.state.currentProdObj.vSizeName,

            iReworkedCount: this.state.reworkedCount,
            dLastUpdated: dateObj
        };

        //console.log(currentReworkedCountObj);
        writeReworkedToLocalDB(currentReworkedCountObj);

      });
    }

    filterDefectesCategoryWise(categoryId: string){
      var filteredDefects = this.state.allDefects.filter(x=> x.vDefectCategoryId === categoryId);
      this.setState({selectedDefectCategory: categoryId, filteredDefects, shwoNextButton:false},()=> console.log("Defectes Count",filteredDefects.length))
    }

    componentWillUnmount(){
      console.log('unmounted production count');
    }

    componentDidMount(){
      Orientation.lockToLandscapeLeft();
      var currentCountObj: any = {};
      const reqObj: any = this.props.navigation.getParam('userData');
      var current_login: any = getCurrentLoggedInUserForToday(this.state.today);
      let allDefects: any = getAllDefects();
      var defectCategories = getUniqueAttributes(allDefects, "vDefectCategoryId", "vDefectCategoryName", "vHeadShortName");
      var currentHour = getCurrentHourId();

      if(currentHour === undefined){
            Toast.show({
              type: "error",
              position: 'bottom',
              text1: "Alert!",
              text2: "This Hour is not available for Production Entry!, Try Again after sometimes.",
              visibilityTime: 1500,
              });
      }else{
          let existingData: any = getCurrentHourExistingData(reqObj, currentHour, current_login)
          let totalDayFttCount = getTodaysTotalFttCount(reqObj);
          let totalDayDefectCount = getTodaysTotalDefectCount(reqObj);
          let totalDayRejectCount = getTodaysTotalRejectCount(reqObj);
          let totalDayReworkedCount = getTodaysTotalReworkCount(reqObj);
          
              if(existingData === undefined){
                console.log('Not Found Any Data Count');
                currentCountObj =
                    {
                      iAutoId: 0,
                      vDeviceId: current_login.vDeviceId,
                      dEntryDate: dateObj,
                      dLastUpdated: dateObj,
                      vProductionPlanId: reqObj.vProductionPlanId,
                      vUnitLineId: current_login.vUnitLineId,

                      vBuyerId:  reqObj.vBuyerId,
                      vBuyerName: reqObj.vBuyerName,
                
                      vStyleId:  reqObj.vStyleId,
                      vStyleName: reqObj.vStyleName,
                
                      vExpPoorderNo:  reqObj.vExpPoorderNo,
                
                      vColorId:  reqObj.vColorId,
                      vColorName: reqObj.vColorName,
                
                      vSizeId:  reqObj.vSizeId,
                      vSizeName: reqObj.vSizeName,

                      iProductionQty: 0,

                      vHourId: currentHour["vHourId"],
                      dDateOfProduction: reqObj.dDate,
                      dStartTimeOfProduction: currentHour.dStartTimeOfProduction,
                      dEndTimeOfProduction: currentHour.dEndTimeOfProduction,
                      dShipmentDate: reqObj.dShipmentDate,
                      iTarget: reqObj.iTarget,
                      vProTypeId: 'PT1',
                      nHour: currentHour.nHour,
                      iManPower: reqObj.iManpower,
                      vPreparedBy: current_login.vDeviceId,
                      vShiftId: reqObj.vShiftId
                  };
              }else{
                console.log('Found Existing Data Count:', existingData.iProductionQty)
                currentCountObj = existingData;
              }
            
          this.setState({
            currentProdObj: reqObj,allDefects,defectCategories,
            currentHour: currentHour["vHourId"], 
            currentHourObj: currentHour, 
            current_login, 
            currentCountObj, 
            fttCount: currentCountObj.iProductionQty, //current hour wise counter
            
            defectCount: totalDayDefectCount,
            rejectCount: totalDayRejectCount,
            reworkedCount: totalDayReworkedCount,

            totalDayFttCount,
            totalDayDefectCount ,
            totalDayRejectCount,
            totalDayReworkedCount
            //TODO: totalDayFttCount will be total of all hours ftt summation.
          },()=>{
            console.log('write initial production cout object to local db')
            writeProductionToLocalDB(this.state.currentCountObj);
          });
          //TODO: dDateOfProduction= dateObj;  should be the today's date, the day production count took place so that if device shutsdown we can retrive earlier production count data of today
        }
      /***TODO: Will have to check local db if there is anydata available for -> today -> This hour -> this device -> unitlineId -> production PlanID wise
       * if exists set current production count object to existing production count object
       * other wise create new object and insert into localdb and set state object to that new production object...
       */

    }


    selectDefectHead(defectHeadCode: string){
      var selectedDefectObj = this.state.filteredDefects.filter(x=> x.vHeadId === defectHeadCode)[0];
      if(selectedDefectObj === null){
        return;
      }
      this.setState({
        selectedDefectObj, 
        selectedDefectHeadId: selectedDefectObj.vHeadId, 
        shwoNextButton:true
      },()=>{
        console.log("in state",this.state.selectedDefectObj.vHeadName)
      });
    }

    _onLayout(e: any) {
      console.log("Screen Orientation Changed...")
      this.setState({
        screenWidth: Dimensions.get('window').width,
        screenHeight: Dimensions.get('window').height
      })
  
    }

    setModalVisible(modeCode: number) {
      if(modeCode === constKVP.__MODAL_FOR_DEFECT){
        let modeColor: string = "#fda912";
        this.setState((prevState/*, props*/) => ({
          modalVisible: !prevState.modalVisible,
          modeColor, modeCode
        }));
      }else if(modeCode === constKVP.__MODAL_FOR_REJECT){
        //modeCode => constKVP.__MODAL_FOR_REJECT
        let modeColor: string = "#ff5353";
        this.setState((prevState/*, props*/) => ({
          modalVisible: !prevState.modalVisible,
          modeColor, modeCode
        }));
      }else{
        let modeColor: string = "#3d9efd";
        this.setState((prevState/*, props*/) => ({
          modalVisible: !prevState.modalVisible,
          modeColor, modeCode: -1
        }));
      }
    }


  render() {
    const {screenHeight, screenWidth} = this.state
    //style={[{flex: 1, margin: moderateScale(10), flexDirection:'column'}, styles.elementsContainer]}
    return (
      <View style={styles.container} >
        
      <StatusBar hidden={true}/>
        <View style={screenHeight > screenWidth ? styles.ContainerPortrait : styles.ContainerLandscape} onLayout={this._onLayout.bind(this)}>
          
          <View style={{flex:.65, flexDirection:'row', justifyContent:'space-evenly', borderWidth: 1, borderColor: 'green'}}>
            <View style={{flex:.1, justifyContent:'center', alignItems:'center'}}>
                {/* <Text>green</Text> */}
                <View style={{height: 20, width:20, backgroundColor: this.state.isSynced ? 'green' : 'red', borderRadius: 25 }} />
            </View>


          <View style={{flex: .8, flexDirection:'column', justifyContent:'space-around'}}>
            <View style={{flex:1, flexDirection:'row', justifyContent:'space-around', borderBottomColor:'green'}}>
                <Text numberOfLines={1} style={{flex:1, fontSize: moderateScale(11), fontWeight:'bold', textAlign:'center'}}>Buyer: {this.state.currentProdObj.vBuyerName}</Text>
                <Text numberOfLines={1} style={{flex:1, fontSize: moderateScale(11), fontWeight:'bold', textAlign:'center'}}>Style: {this.state.currentProdObj.vStyleName}</Text>
                <Text numberOfLines={1} style={{flex:1, fontSize: moderateScale(11), fontWeight:'bold', textAlign:'center'}}>ExPo: {this.state.currentProdObj.vExpPoorderNo}</Text>
            </View>
            <View style={{flex:1, flexDirection:'row', justifyContent:'space-around'}}>
                <Text numberOfLines={1} style={{flex:1, fontSize: moderateScale(11), fontWeight:'bold', textAlign:'center'}}>Color: {this.state.currentProdObj.vColorName}</Text>
                <Text numberOfLines={1} style={{flex:1, fontSize: moderateScale(11), fontWeight:'bold', textAlign:'center'}}>Size: {this.state.currentProdObj.vSizeName}</Text>
                <Text numberOfLines={1} style={{flex:1, fontSize: moderateScale(11), fontWeight:'bold', textAlign:'center'}}>Shipment: {moment(this.state.currentProdObj.dShipmentDate).format('DD-MM-YYYY')}</Text>
            </View>
          </View>

            
            <View style={{flex:.1, justifyContent:'center', alignItems:'center'}}>
              <Text style={{fontSize: 16, fontWeight:'bold'}}>{ this.state.currentHour ?? "N/A"}</Text>
            </View>
          </View>

          {/* <View style={{flex: 6, flexDirection: 'column'}}>

          </View> */}
          <View style={{flex: 3, marginBottom:moderateScale(10), flexDirection:'row'}}>

            <Pressable onPress={()=>this.countFtt()} style={{...styles.CountTileStyle, backgroundColor: '#45c065'}}>
              <Text style={{fontSize: moderateScale(25), fontWeight:'bold'}}>ACCEPT</Text>
              <Text style={{fontSize: moderateScale(25), fontWeight:'bold', color: '#fff'}}>{this.state.totalDayFttCount}</Text>
            </Pressable >
            
            <Pressable onPress={()=>this.setModalVisible(constKVP.__MODAL_FOR_DEFECT)} style={{...styles.CountTileStyle, marginLeft:moderateScale(10),  backgroundColor: '#fda912'}}>
                <Text style={{fontSize: moderateScale(25), fontWeight:'bold'}}>DEFECT</Text>
                <Text style={{fontSize: moderateScale(25), fontWeight:'bold', color: '#fff'}}>{this.state.totalDayDefectCount}</Text>
            </Pressable>

          </View>

          <View style={{flex: 3, flexDirection:'row'}}>
            
            <Pressable onPress={()=>this.setModalVisible(constKVP.__MODAL_FOR_REJECT)} style={{...styles.CountTileStyle, backgroundColor: '#ff5353'}}>
            <Text style={{fontSize: moderateScale(25), fontWeight:'bold'}}>REJECT</Text>
            <Text style={{fontSize: moderateScale(25), fontWeight:'bold', color: '#fff'}}>{this.state.totalDayRejectCount}</Text>
            </Pressable>

            <Pressable onPress={()=>this.countreworked()} style={{...styles.CountTileStyle, marginLeft:moderateScale(10),   backgroundColor: '#3d9efd'}}>
            <Text style={{fontSize: moderateScale(25), fontWeight:'bold'}}>REWORKED</Text>
            <Text style={{fontSize: moderateScale(25), fontWeight:'bold', color: '#fff'}}>{this.state.totalDayReworkedCount}</Text>
            </Pressable>

          </View>

        </View>
        
        <View>
                <Modal
                  animationType="fade"
                  transparent={true}
                  visible={this.state.modalVisible}
                  onRequestClose={() => this.setModalVisible(-1) }>
                  <View style={{height: this.state.screenHeight, width: this.state.screenWidth, backgroundColor:'rgba(0,0,0,0.7)'}}>
                    <View style={{ flex:1, flexDirection:'column', justifyContent:'space-between', borderColor:'green', borderWidth:1, borderRadius:10, marginVertical: this.state.screenHeight/8, backgroundColor:'#fff',  margin:10, padding:10}}>
                        <View style={{flex:1, flexDirection:'row', justifyContent:'space-between',  margin:10}}>
                          {
                            this.state.showStyleImage ? 
                            <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                                <Text style={{fontWeight:'bold', fontSize:25, color:'red'}}>Style Image Will Be shown here.</Text>
                                <Button onPress={()=>{
                                  this.setState({showStyleImage: false},()=>{
                                    this.setModalVisible(-1);
                                  })
                                }} title={"Close (X)"}></Button>
                            </View>
                            :
                                <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', }}>
                                  <View style={{flex:.49, flexDirection:'column', justifyContent:'center', alignItems:'center',  margin:10}}>
                                    {
                                      this.state.defectCategories.map((item, index) => {
                                          return(<View style={{flex:1, padding:5, flexDirection:'row', width: screenWidth/2, justifyContent:'space-around'}} key={index}>
                                            {
                                                  <TouchableOpacity key={index} 
                                                    style={{
                                                      padding:5, 
                                                      borderRadius:25,
                                                      justifyContent:'center', 
                                                      alignItems:'center', 
                                                      borderWidth:1, 
                                                      borderColor: item.vDefectCategoryId === this.state.selectedDefectCategory ? '#880e4f' : '#b58ba2'
                                                    }} 
                                                    onPress={() => this.filterDefectesCategoryWise(item.vDefectCategoryId)}>
                                                        <Text style={{fontWeight:'bold', color: item.vDefectCategoryId === this.state.selectedDefectCategory ? '#880e4f' : '#b58ba2' , fontSize: 12}}>{item.vDefectCategoryId === this.state.selectedDefectCategory ? (item.vDefectCategoryName+" ("+item.vHeadShortName+")   ✔") : (item.vDefectCategoryName+" ("+item.vHeadShortName+")")}</Text>
                                                  </TouchableOpacity>
                                            }
                                          </View>)
                                      })
                                    }
                                    </View>
                                    <View style={{flex:.49, flexDirection:'column', justifyContent:'center', alignItems:'center',  margin:10}}>
                                      {
                                        this.state.filteredDefects.length > 0 ? 
                                            <ScrollView horizontal={false}>
                                                <View style={{flex:1, alignItems: 'center', justifyContent:'center'}}>
                                                  {
                                                    this.state.filteredDefects.map((item, index) => {
                                                        return(<View style={{flex:1,  padding:5, flexDirection:'row', justifyContent:'space-around'}} key={index}>
                                                          {//selectedDefectHeadId
                                                                <TouchableOpacity key={index} 
                                                                  style={{
                                                                    padding:5, 
                                                                    borderRadius:25, 
                                                                    borderWidth:1, 
                                                                    borderColor: item.vHeadId === this.state.selectedDefectHeadId ? "green":'#7fb37f'
                                                                    }} onPress={() => this.selectDefectHead(item.vHeadId)}>
                                                                      <Text 
                                                                        style={{
                                                                            fontWeight:'bold', 
                                                                            maxWidth: screenWidth/3, 
                                                                            textAlignVertical:'center', 
                                                                            textAlign:'center', 
                                                                            color:item.vHeadId === this.state.selectedDefectHeadId ? "green":'#7fb37f',
                                                                            fontSize: 12
                                                                            }}>
                                                                          {item.vHeadId === this.state.selectedDefectHeadId ? ("("+item.code+") -> "+item.vHeadName+"   ✔✔") : ("("+item.code+") -> "+item.vHeadName)}
                                                                        </Text>
                                                                </TouchableOpacity>
                                                          }
                                                        </View>)
                                                    })
                                                  }
                                                </View>
                                            </ScrollView> : <Text style={{fontWeight:'bold', color:'red'}}>Select One Category</Text>

                                      }
                                      
                                    </View>
                                    <View style={{
                                            flex:.02, 
                                            transform: [{ scale: this.state.shwoNextButton ? 1 : 0 }], 
                                            flexDirection:'column', 
                                            borderRadius:25, 
                                            justifyContent:'center', 
                                            backgroundColor: this.state.modeColor, 
                                            alignItems:'center',  
                                            margin:10
                                            }}>
                                        <TouchableOpacity 
                                          style={{flex:1, justifyContent:'center', alignItems:'center'}} 
                                          onPress={()=> {
                                            /***This logic will be updated when style related images will be used for defect place tracking... */
                                            if(this.state.modeCode === constKVP.__MODAL_FOR_DEFECT){
                                                this.countDefect()
                                            }else{
                                              //this.state.modeCode === constKVP.__MODAL_FOR_REJECT
                                                this.countreject();
                                            } 
                                            /*this.setState({showStyleImage: true})*/
                                          }}
                                          >
                                          <Text style={{textAlign:'center', fontWeight:'bold', color:'#fff', fontSize: 25, textTransform:'uppercase'}}>{">"}</Text>
                                        </TouchableOpacity>
                                    </View>
                              </View>   
                          } 
                        </View>
                        <View style={{flex:1, position:'absolute', right: 0, top: 0, marginTop: -10}}>
                          <TouchableOpacity style={{width:30, height:30,marginTop:10, borderTopRightRadius:7, borderBottomLeftRadius:7, backgroundColor:'green', flex:1, justifyContent:'center'}} onPress={() => this.setModalVisible(-1)}>
                              <Text style={{textAlign:'center', fontWeight:'bold', color:'#fff', fontSize: 15, textTransform:'uppercase'}}>X</Text>
                          </TouchableOpacity>
                        </View>
                    </View>
                  </View>
                </Modal>
              </View>
  </View>
    )
  }
}

const styles = StyleSheet.create({
    container: {
      //marginTop: 48,
      flex: 1
    },
    headerStyle: {
      fontSize: 36,
      textAlign: 'center',
      fontWeight: '100',
      //marginBottom: 24
    },
    CountTileStyle:{
      flex: 1,
      flexDirection:'row', 
      justifyContent: 'space-evenly', 
      alignItems:'center'
    },
    ContainerPortrait: {
      flex: 1,
      // flexDirection: 'column',
      // justifyContent: 'center',
      // alignItems: 'center'
    },
    ContainerLandscape: {
      flex: 1
      // flexDirection: 'row',
      // justifyContent: 'center',
      // alignItems: 'center'
    },
    elementsContainer: {
      backgroundColor: '#ecf5fd',
      //margin: 5,
      //marginLeft: 24,
      //marginRight: 24,
      //marginBottom: 24
    },
    cardShadow:{
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.20,
      shadowRadius: 1.41,
      elevation: 3,
  
      borderWidth:0.3,
      borderRadius:10,
      borderColor:'green'
    }
  
  });

export default ProductionCountSizeWise
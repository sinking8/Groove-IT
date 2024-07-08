import React, { Component } from 'react';
import { Card, CardBody,Col,Image,Row } from 'react-bootstrap';

function SampleVideo(props){
    const url = "https://res.cloudinary.com/dmr4n68im/video/upload/v1719631173/"
    return(
    <Card className='m-2' onClick={() => {
        props.setVideo({'public_id':props.video['public_id'],'cloud_name':props.video['cloud_name']});  
      }}>
        <CardBody className='row p-1 m-0'>
            <Col className='p-0'>
                <Image src={url+props.video['public_id']+".jpg"}></Image>
            </Col>
            </CardBody>            
      </Card>)
}
export default SampleVideo;
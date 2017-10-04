//
//  ARCamera+Decompose.m
//  ARGlitch
//
//  Created by Nate Parrott on 10/4/17.
//  Copyright © 2017 Nate Parrott. All rights reserved.
//

#import "ARCamera+Decompose.h"
#import <UIKit/UIKit.h>

@implementation ARCamera (Decompose)

- (ARCameraPosition)computePosition {
    // copied from Google's WebARonARKit app
    matrix_float4x4 viewMatrix =
    [self viewMatrixForOrientation:UIInterfaceOrientationPortrait];
    matrix_float4x4 modelMatrix = matrix_invert(viewMatrix);
    CGSize viewportSize = [UIScreen mainScreen].bounds.size;
    matrix_float4x4 projectionMatrix = [self
                                        projectionMatrixForOrientation:UIInterfaceOrientationPortrait
                                        viewportSize:CGSizeMake(viewportSize.width,
                                                                viewportSize.height)
                                        zNear:0.1
                                        zFar:80];
    
    const float *pModelMatrix = (const float *)(&modelMatrix);
    const float *pViewMatrix = (const float *)(&viewMatrix);
    const float *pProjectionMatrix = (const float *)(&projectionMatrix);
    
    simd_quatf orientationQuat = simd_quaternion(modelMatrix);
    const float *pOrientationQuat = (const float *)(&orientationQuat);
    
    ARCameraPosition pos;
    pos.x = pModelMatrix[12];
    pos.y = pModelMatrix[13];
    pos.z = pModelMatrix[14];
    pos.q0 = pOrientationQuat[0];
    pos.q1 = pOrientationQuat[1];
    pos.q2 = pOrientationQuat[2];
    pos.q3 = pOrientationQuat[3];
    return pos;
}

@end

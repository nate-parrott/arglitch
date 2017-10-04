//
//  ARCamera+Decompose.h
//  ARGlitch
//
//  Created by Nate Parrott on 10/4/17.
//  Copyright © 2017 Nate Parrott. All rights reserved.
//

#import <ARKit/ARKit.h>

typedef struct {
    double x, y, z, q0, q1, q2, q3;
} ARCameraPosition;

@interface ARCamera (Decompose)

- (ARCameraPosition)computePosition;

@end
